import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Film, GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react'
import type { MediaFile } from '@/types/listingWizard'

interface MediaUploadZoneProps {
  files: MediaFile[]
  onChange: (files: MediaFile[]) => void
}

function createMediaFile(file: File): Promise<MediaFile> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    resolve({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url,
      type: file.type.startsWith('video/') ? 'video' : 'image',
    })
  })
}

export function MediaUploadZone({ files, onChange }: MediaUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  async function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    const incoming = await Promise.all(Array.from(fileList).map(createMediaFile))
    onChange([...files, ...incoming])
  }

  function removeFile(id: string) {
    onChange(files.filter((f) => f.id !== id))
  }

  function moveFile(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= files.length) return
    const copy = [...files]
    ;[copy[index], copy[next]] = [copy[next], copy[index]]
    onChange(copy)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function handleReorderDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return
    const copy = [...files]
    const [moved] = copy.splice(dragIndex, 1)
    copy.splice(targetIndex, 0, moved)
    onChange(copy)
    setDragIndex(null)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
          dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50'
        }`}
      >
        <Upload className="h-10 w-10 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-700">Drag & drop photos or videos</p>
        <p className="mt-1 text-xs text-slate-500">PNG, JPG, MP4 · Min 3 photos recommended</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            {files.length} file{files.length > 1 ? 's' : ''} · drag cards to reorder
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleReorderDrop(index)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-400" />
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {file.type === 'video' ? (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800">
                      <Film className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                  )}
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white">
                      Cover
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                  <p className="text-xs capitalize text-slate-500">{file.type}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button type="button" onClick={() => moveFile(index, -1)} className="rounded p-1 hover:bg-slate-100" aria-label="Move up">
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </button>
                  <button type="button" onClick={() => moveFile(index, 1)} className="rounded p-1 hover:bg-slate-100" aria-label="Move down">
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
                <button type="button" onClick={() => removeFile(file.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <ImagePlus className="h-4 w-4 shrink-0" />
          Add at least 3 photos for better listing visibility
        </div>
      )}
    </div>
  )
}
