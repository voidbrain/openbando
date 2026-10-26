"""Package imagegen atlas cells and composite the shared timeline. Requires Pillow.
Run from repo root: python tools/mascot/build.py
Source art stays unchanged; exports use nearest-neighbour scaling only.
"""
import json, math
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/mascot'
NAMES = ['idle','look-quarter-a','look-quarter-b','side','run-a','run-pass','run-b','crouch','low','sit','rise','look-up','anticipate','jump','victory','back']
atlas = Image.open(ROOT / 'docs/mascot/pilot-source.png').convert('RGBA')
# Production packing: equal atlas cells, common scale, bottom-anchored poses. Never stretch poses independently.
scale = 0.34
# Reviewed source bounds: imagegen padding is not an exact grid (jump fist crosses a row boundary).
RECTS=[(115,13,286,311),(413,13,582,311),(726,13,902,311),(1023,14,1191,315),
       (89,325,291,601),(408,325,594,604),(708,325,914,601),(1032,378,1213,598),
       (96,612,282,881),(398,650,588,881),(720,616,899,886),(1033,612,1209,894),
       (99,937,283,1185),(412,884,615,1160),(712,909,905,1189),(1056,909,1212,1189)]
poses=[]
for i,name in enumerate(NAMES):
    sprite=atlas.crop(RECTS[i])
    sprite=sprite.resize((round(sprite.width*scale),round(sprite.height*scale)),Image.Resampling.NEAREST)
    frame=Image.new('RGBA',(128,128))
    frame.alpha_composite(sprite,((128-sprite.width)//2,120-sprite.height))
    frame.save(OUT / 'poses' / f'{i:02}-{name}.png',optimize=True)
    poses.append(frame)
drone=Image.open(ROOT/'docs/mascot/drone-source.png').convert('RGBA')
drone=drone.crop(drone.getchannel('A').point(lambda a:255 if a>100 else 0).getbbox())
drone.thumbnail((64,48),Image.Resampling.NEAREST)
drone.save(OUT/'drone.png',optimize=True)
poses[0].save(OUT/'poster.png',optimize=True)
sheet=Image.new('RGBA',(512,512))
for i,p in enumerate(poses):sheet.alpha_composite(p,((i%4)*128,(i//4)*128))
sheet.save(OUT/'keyframes.png',optimize=True)
t=json.loads((OUT/'timeline.json').read_text()); frames=[]
for ms in range(0,t['duration'],100):
    phase=next(p for p in t['phases'] if p['start']<=ms<p['end']);u=(ms-phase['start'])/(phase['end']-phase['start'])
    ids=phase['poses'];idx=ids[int((ms-phase['start'])/120)%len(ids)]
    pilot=poses[idx]
    if phase.get('mirror'):pilot=pilot.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    frame=Image.new('RGBA',(320,160));jump=round(-18*math.sin(u*math.pi)) if phase.get('jump') else 0
    frame.alpha_composite(pilot,(24,24+jump))
    x,y,x1,y1=phase['drone'];dx=round(x+(x1-x)*u);dy=round(y+(y1-y)*u)
    frame.alpha_composite(drone,(dx-drone.width//2,dy-drone.height//2))
    frames.append(frame)
# Transparent GIF uses a fixed palette to avoid per-frame colour pumping.
palette=Image.new('RGB',(320,160*len(frames)))
for i,f in enumerate(frames):palette.paste(f.convert('RGB'),(0,160*i))
palette=palette.quantize(colors=255)
gif=[]
for f in frames:
    q=f.convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE)
    q.paste(255,mask=f.getchannel('A').point(lambda a:255 if a<128 else 0));q.info['transparency']=255;gif.append(q)
gif[0].save(OUT/'openbando-mascot.gif',save_all=True,append_images=gif[1:],duration=100,loop=0,transparency=255,disposal=2,optimize=False)
print('16 pose PNGs, poster, drone, contact sheet and 16-second GIF exported')
