import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource, type Photo } from "@capacitor/camera";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { useProgressStore, type ProgressMedia } from "../store/useProgressStore";

const DIR = "progress";

export async function captureProgressPhoto(): Promise<ProgressMedia | null> {
  let photo: Photo;
  try {
    photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 85,
      width: 1440,
      height: 1920,
      correctOrientation: true,
      saveToGallery: false,
      allowEditing: false,
    });
  } catch (e) {
    if (e instanceof Error && /cancel/i.test(e.message)) return null;
    throw e;
  }
  if (!photo.base64String) throw new Error("Kamera ei palauttanut kuvaa.");

  const id = String(Date.now());
  const fileName = `${id}.jpg`;
  await Filesystem.writeFile({
    path: `${DIR}/${fileName}`,
    directory: Directory.Data,
    data: photo.base64String,
    recursive: true,
  });

  const note = window.prompt("Muistiinpano (valinnainen)")?.trim() || undefined;
  const media: ProgressMedia = {
    id,
    type: "photo",
    fileName,
    takenAt: new Date().toISOString(),
    note,
  };
  useProgressStore.getState().addMedia(media);
  return media;
}

export async function deleteProgressMedia(id: string): Promise<void> {
  const m = useProgressStore.getState().media.find((x) => x.id === id);
  if (m) {
    try {
      await Filesystem.deleteFile({
        path: `${DIR}/${m.fileName}`,
        directory: Directory.Data,
      });
    } catch {
      // File may already be gone; remove the metadata regardless.
    }
  }
  useProgressStore.getState().removeMedia(id);
}

const urlCache = new Map<string, string>();

export async function resolveMediaUrl(fileName: string): Promise<string> {
  const cached = urlCache.get(fileName);
  if (cached) return cached;
  const { uri } = await Filesystem.getUri({
    path: `${DIR}/${fileName}`,
    directory: Directory.Data,
  });
  const url = Capacitor.convertFileSrc(uri);
  urlCache.set(fileName, url);
  return url;
}