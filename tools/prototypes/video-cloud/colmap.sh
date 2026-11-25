#!/bin/zsh
# F-053: COLMAP on a flight video (CPU), each piece placed by the flight's log, points merged and scored.
# Usage: colmap.sh <repo> <workDir> [video] [log] [fps] [offset]
#   workDir outside the repository; video and log default to the demo flight; without an offset the app's auto-sync
#   (sync.mjs) measures it. Needs colmap and ffmpeg (e.g. Homebrew). Nothing leaves this machine.
set -e
R=${1:A}; C=${2:A}
V=${3:-$R/public/guide-demo/flight.mp4}; L=${4:-$R/public/guide-demo/flight.csv}
V=${V:A}; L=${L:A}; FPS=${5:-6}; OFF=$6
mkdir -p $C/images && cd $C
if [ -z "$OFF" ]; then
  node $R/tools/prototypes/video-cloud/sync.mjs $R $V $L > sync.json
  OFF=$(node -e 'const o=JSON.parse(require("fs").readFileSync("sync.json","utf8"));if(o.offset==null)process.exit(1);console.log(o.offset)') \
    || { echo "auto-sync found no match: $(cat sync.json)"; exit 1; }
fi
echo "offset $OFF s"
[ -n "$(ls images)" ] || ffmpeg -loglevel error -i $V -vf "fps=$FPS,scale=960:-2" -q:v 2 images/f%04d.jpg
rm -rf db.db sparse aligned && mkdir sparse aligned
colmap feature_extractor --database_path db.db --image_path images --ImageReader.single_camera 1 \
  --ImageReader.camera_model OPENCV --FeatureExtraction.use_gpu 0 > extract.log 2>&1
colmap sequential_matcher --database_path db.db --FeatureMatching.use_gpu 0 --SequentialMatching.overlap 30 > match.log 2>&1
colmap mapper --database_path db.db --image_path images --output_path sparse > map.log 2>&1
node $C/colmap.mjs refs $L $C $FPS $OFF
: > merged-points3D.txt
for m in sparse/*/; do
  n=$(basename $m); mkdir -p aligned/$n aligned/$n-txt
  colmap model_aligner --input_path $m --output_path aligned/$n --ref_images_path refs.txt --ref_is_gps 0 \
    --alignment_type custom --alignment_max_error 3 > aligned/$n.log 2>&1 || { echo "piece $n: not aligned"; continue; }
  colmap model_converter --input_path aligned/$n --output_path aligned/$n-txt --output_type TXT > /dev/null
  err=$(grep 'Alignment error' aligned/$n.log | sed -E 's/.*=> //')
  med=$(echo $err | sed -E 's/.*, ([0-9.]+) \(median\).*/\1/')
  # a piece the log cannot place (median camera error over 5 m: too few or too clustered frames) is left out
  if (( med > 5 )); then echo "piece $n: left out, $err"; continue; fi
  echo "piece $n: $(grep -c '\.jpg' aligned/$n-txt/images.txt) images, $err"
  grep -v '^#' aligned/$n-txt/points3D.txt >> merged-points3D.txt
done
node $C/colmap.mjs score $L $C merged-points3D.txt merged $OFF
