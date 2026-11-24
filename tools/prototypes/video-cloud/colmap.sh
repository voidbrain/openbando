#!/bin/zsh
# Route (a) of the F-053 trial: COLMAP on the demo video (CPU), each piece placed by the log, points merged.
# Usage: colmap.sh <repo> <workDir> [fps]   (workDir outside the repository; needs colmap and ffmpeg, e.g. Homebrew)
set -e
R=${1:A}; C=$2; FPS=${3:-6}
mkdir -p $C/images && cd $C
[ -n "$(ls images)" ] || ffmpeg -loglevel error -i $R/public/guide-demo/flight.mp4 -vf "fps=$FPS,scale=960:-2" -q:v 2 images/f%04d.jpg
rm -rf db.db sparse aligned && mkdir sparse aligned
colmap feature_extractor --database_path db.db --image_path images --ImageReader.single_camera 1 \
  --ImageReader.camera_model OPENCV --FeatureExtraction.use_gpu 0 > extract.log 2>&1
colmap sequential_matcher --database_path db.db --FeatureMatching.use_gpu 0 --SequentialMatching.overlap 30 > match.log 2>&1
colmap mapper --database_path db.db --image_path images --output_path sparse > map.log 2>&1
node $C/colmap.mjs refs $R $C $FPS
: > merged-points3D.txt
for m in sparse/*/; do
  n=$(basename $m); mkdir -p aligned/$n aligned/$n-txt
  colmap model_aligner --input_path $m --output_path aligned/$n --ref_images_path refs.txt --ref_is_gps 0 \
    --alignment_type custom --alignment_max_error 3 > aligned/$n.log 2>&1 || { echo "piece $n: not aligned"; continue; }
  colmap model_converter --input_path aligned/$n --output_path aligned/$n-txt --output_type TXT > /dev/null
  echo "piece $n: $(grep -c '\.jpg' aligned/$n-txt/images.txt) images, $(grep 'Alignment error' aligned/$n.log | sed -E 's/.*=> //')"
  grep -v '^#' aligned/$n-txt/points3D.txt >> merged-points3D.txt
done
node $C/colmap.mjs score $R $C merged-points3D.txt merged
