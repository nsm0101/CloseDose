# Cappy look mechanics

## Natural motion

Cappy is a soft, low, quadrupedal capybara with a long muzzle, large physical eyeballs, small rounded ears, and no props. The feet and lower torso stay planted and registered. The eyes lead by rotating as complete eyeballs inside their sockets, with the pupils, sclera, eyelids, and highlights moving together. The muzzle and head follow with a restrained yaw or pitch; the neck and upper shoulders compress or extend subtly; the ears lag by a small amount. The belly, rump, and foot placement remain stable.

Do not rotate, skew, or tilt the whole sprite. Do not slide pupils over fixed eye whites. Preserve the large-eye construction, muzzle length, buck teeth, whiskers, fur color, and compact body volume in every direction.

## Cardinal pose families

- `000 up`: feet and rump anchored; head tips upward, muzzle rises and shortens slightly in projection, pupils/whole eyes rotate toward the top edge, upper eyelids open, chin and buck teeth become more visible, ears settle slightly back.
- `090 screen-right`: Cappy turns head and muzzle toward the viewer's right; the nose tip and pupils cross to the right of head center; the right-facing muzzle profile becomes dominant; the near right-side cheek and shoulder are more visible while the far ear and far eye become slightly occluded.
- `180 down`: feet and rump anchored; head lowers toward the chest, muzzle points down and overlaps the upper chest, whole eyes rotate downward with lowered upper lids, ears angle forward slightly, and the shoulders compress.
- `270 screen-left`: Cappy turns head and muzzle toward the viewer's left; the nose tip and pupils cross to the left of head center; the left-facing muzzle profile becomes dominant; the near left-side cheek and shoulder are more visible while the far ear and far eye become slightly occluded.

## Motion budget and continuity

Each 22.5-degree step moves the eyes first, then the muzzle/head, then the ears and upper shoulders by an even small increment. The feet, belly baseline, rump center, scale, and lower-body silhouette stay constant. Adjacent poses must not flip the visible cheek, teleport an ear, change the number or design of teeth, alter eye size, or jump laterally. `157.5 -> 180` and `337.5 -> 000` must be one ordinary step. Whiskers remain attached and may change overlap naturally without detaching or becoming motion lines.
