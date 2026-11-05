import cv2
import os

video_dir = r"C:\Users\tarun\Videos\uiux"
output_dir = r"C:\Users\tarun\.gemini\antigravity\brain\1ea36d88-73a8-4968-95c6-6de9568f0d51\detailed_frames"
os.makedirs(output_dir, exist_ok=True)

percentages = [0.05, 0.20, 0.35, 0.50, 0.65, 0.80, 0.95]

for vf in sorted(os.listdir(video_dir)):
    if not vf.endswith('.mp4'): continue
    clean_name = vf.replace(' ', '_').replace('.mp4', '')
    sub_dir = os.path.join(output_dir, clean_name)
    os.makedirs(sub_dir, exist_ok=True)

    cap = cv2.VideoCapture(os.path.join(video_dir, vf))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    print(f"Processing {vf}: {total_frames} frames, {fps} fps")
    for i, p in enumerate(percentages):
        frame_idx = int(total_frames * p)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if ret:
            out_path = os.path.join(sub_dir, f"frame_{i+1:02d}.jpg")
            cv2.imwrite(out_path, frame)
            print(f"  Saved {out_path}")
    cap.release()
print("Done!")
