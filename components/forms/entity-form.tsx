import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function EntityForm({
  action,
  fields,
  defaults,
  submitText = '保存'
}: {
  action: (formData: FormData) => void | Promise<void>
  fields: Array<'name' | 'description' | 'owner' | 'category' | 'vendor'>
  defaults?: Record<string, string | null | undefined>
  submitText?: string
}) {
  const status = defaults?.lifecycleStatus ?? 'ACTIVE'
  return (
    <form action={action} className="space-y-3">
      {fields.includes('name') && (
        <div>
          <Label>名称</Label>
          <Input name="name" required defaultValue={defaults?.name ?? ''} />
        </div>
      )}
      {fields.includes('description') && (
        <div>
          <Label>描述</Label>
          <Textarea name="description" defaultValue={defaults?.description ?? ''} />
        </div>
      )}
      {fields.includes('owner') && (
        <div>
          <Label>Owner</Label>
          <Input name="owner" defaultValue={defaults?.owner ?? ''} />
        </div>
      )}
      {fields.includes('category') && (
        <div>
          <Label>分类</Label>
          <Input name="category" defaultValue={defaults?.category ?? ''} />
        </div>
      )}
      {fields.includes('vendor') && (
        <div>
          <Label>厂商</Label>
          <Input name="vendor" defaultValue={defaults?.vendor ?? ''} />
        </div>
      )}
      <div>
        <Label>生命周期</Label>
        <select name="lifecycleStatus" defaultValue={status} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="PLANNED">PLANNED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUNSETTING">SUNSETTING</option>
          <option value="RETIRED">RETIRED</option>
        </select>
      </div>
      <Button type="submit">{submitText}</Button>
    </form>
  )
}
