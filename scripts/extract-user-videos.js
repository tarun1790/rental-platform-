import cv2
import os
import glob

video_dir = r"C:\Users\tarun\Videos\uiux"
output_base = r"C:\Users\tarun\.gemini\antigravity\brain\1ea36d88-73a8-4968-95c6-6de9568f0d51\uiux_reference"
os.makedirs(output_base, exist_ok=True)

videos = sorted(glob.glob(os.path.join(video_dir, "*.mp4")))
print(f"Found {len(videos)} videos in {video_dir}:")

for v in videos:
    vname = os.path.splitext(os.path.basename(v))[0]
    safe_name = "".join(c if c.isalnum() else "_" for c in vname)
    v_out = os.path.join(output_base, safe_name)
    os.makedirs(v_out, exist_ok=True)

    cap = cv2.VideoCapture(v)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / (fps if fps > 0 else 30.0)

    print(f"\nVideo: {os.path.basename(v)}")
    print(f"  Resolution: {w}x{h}, FPS: {fps:.2f}, Frames: {total_frames}, Duration: {duration:.2f}s")

    # Extract 6 key frames evenly spaced
    if total_frames > 0:
        indices = [int(total_frames * (i + 0.5) / 6) for i in range(6)]
        for i, idx in enumerate(indices):
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                frame_path = os.path.join(v_out, f"frame_{i+1:02d}.png")
                cv2.imwrite(frame_path, frame)
                print(f"    Saved frame {i+1} at frame {idx} -> {frame_path}")
    cap.release()

print("\nDone extracting frames!")
