"use server";

import { 
  getProjects, 
  saveProjects, 
  getPages, 
  savePages, 
  getNotes, 
  saveNotes,
  ProjectData,
  PageData,
  NoteData
} from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function fetchAllData() {
  return {
    projects: getProjects(),
    pages: getPages(),
    notes: getNotes()
  };
}

export async function addProject(project: ProjectData) {
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  const projects = getProjects().filter(p => p.id !== id);
  const pages = getPages().filter(p => p.projectId !== id);
  // Optional: delete notes of those pages
  saveProjects(projects);
  savePages(pages);
  revalidatePath("/");
}

export async function addPage(page: PageData) {
  const pages = getPages();
  pages.push(page);
  savePages(pages);
  revalidatePath("/");
}

export async function deletePage(id: string) {
  const pages = getPages().filter(p => p.id !== id);
  savePages(pages);
  revalidatePath("/");
}

export async function addNote(note: NoteData) {
  const notes = getNotes();
  notes.push(note);
  saveNotes(notes);
  revalidatePath("/");
}

export async function deleteNote(id: string) {
  const notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
  revalidatePath("/");
}

export async function updateProjectIcon(id: string, iconName: string) {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index].iconName = iconName;
    saveProjects(projects);
  }
  revalidatePath("/");
}

export async function reorderNotes(pageId: string, orderedIds: string[]) {
  const notes = getNotes();
  // Filter out notes for this page
  const otherNotes = notes.filter(n => n.pageId !== pageId);
  const pageNotes = notes.filter(n => n.pageId === pageId);
  
  // Reorder page notes according to orderedIds
  const reordered = orderedIds.map(id => pageNotes.find(n => n.id === id)).filter(Boolean) as NoteData[];
  
  saveNotes([...otherNotes, ...reordered]);
  revalidatePath("/");
}
