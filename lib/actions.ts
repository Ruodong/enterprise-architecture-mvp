'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { LifecycleStatus } from '@prisma/client'

function getStatus(v: FormDataEntryValue | null): LifecycleStatus {
  const value = String(v ?? 'ACTIVE')
  return (Object.values(LifecycleStatus).includes(value as LifecycleStatus) ? value : 'ACTIVE') as LifecycleStatus
}

export async function createCapability(formData: FormData) {
  await prisma.businessCapability.create({
    data: {
      name: String(formData.get('name') ?? ''),
      description: String(formData.get('description') ?? '') || null,
      owner: String(formData.get('owner') ?? '') || null,
      lifecycleStatus: getStatus(formData.get('lifecycleStatus'))
    }
  })
  revalidatePath('/capabilities')
}

export async function updateCapability(id: string, formData: FormData) {
  await prisma.businessCapability.update({ where: { id }, data: {
    name: String(formData.get('name') ?? ''), description: String(formData.get('description') ?? '') || null,
    owner: String(formData.get('owner') ?? '') || null, lifecycleStatus: getStatus(formData.get('lifecycleStatus'))
  } })
  revalidatePath('/capabilities'); revalidatePath(`/capabilities/${id}`)
}

export async function deleteCapability(id: string) { await prisma.businessCapability.delete({ where: { id } }); revalidatePath('/capabilities') }

export async function createApplication(formData: FormData) {
  await prisma.businessApplication.create({ data: { name: String(formData.get('name') ?? ''), description: String(formData.get('description') ?? '') || null, owner: String(formData.get('owner') ?? '') || null, lifecycleStatus: getStatus(formData.get('lifecycleStatus')) } })
  revalidatePath('/applications')
}
export async function updateApplication(id: string, formData: FormData) {
  await prisma.businessApplication.update({ where: { id }, data: { name: String(formData.get('name') ?? ''), description: String(formData.get('description') ?? '') || null, owner: String(formData.get('owner') ?? '') || null, lifecycleStatus: getStatus(formData.get('lifecycleStatus')) } })
  revalidatePath('/applications'); revalidatePath(`/applications/${id}`)
}
export async function deleteApplication(id: string) { await prisma.businessApplication.delete({ where: { id } }); revalidatePath('/applications') }

export async function createStack(formData: FormData) {
  await prisma.techStack.create({ data: { name: String(formData.get('name') ?? ''), description: String(formData.get('description') ?? '') || null, category: String(formData.get('category') ?? '') || null, lifecycleStatus: getStatus(formData.get('lifecycleStatus')) } })
  revalidatePath('/stacks')
}
export async function updateStack(id: string, formData: FormData) {
  await prisma.techStack.update({ where: { id }, data: { name: String(formData.get('name') ?? ''), description: String(formData.get('description') ?? '') || null, category: String(formData.get('category') ?? '') || null, lifecycleStatus: getStatus(formData.get('lifecycleStatus')) } })
  revalidatePath('/stacks'); revalidatePath(`/stacks/${id}`)
}
export async function deleteStack(id: string) { await prisma.techStack.delete({ where: { id } }); revalidatePath('/stacks') }

export async function createPlatform(formData: FormData) {
  await prisma.techPlatform.create({ data: { name: String(formData.get('name') ?? ''), description: String(formData.get('description') ?? '') || null, vendor: String(formData.get('vendor') ?? '') || null, lifecycleStatus: getStatus(formData.get('lifecycleStatus')) } })
  revalidatePath('/platforms')
}
export async function updatePlatform(id: string, formData: FormData) {
  await prisma.techPlatform.update({ where: { id }, data: { name: String(formData.get('name') ?? ''), description: String(formData.get('description') ?? '') || null, vendor: String(formData.get('vendor') ?? '') || null, lifecycleStatus: getStatus(formData.get('lifecycleStatus')) } })
  revalidatePath('/platforms'); revalidatePath(`/platforms/${id}`)
}
export async function deletePlatform(id: string) { await prisma.techPlatform.delete({ where: { id } }); revalidatePath('/platforms') }
