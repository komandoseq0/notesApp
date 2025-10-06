import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { NewNote } from '../components/NewNote';
import { useLocalStorage } from '../public/useLocalStorage';
import { v4 as uuidV4 } from 'uuid';
import { useMemo } from 'react';
import { NoteList } from '../components/NoteList';
import { NoteLayout } from '../components/NoteLayout';
import { Note } from '../components/Note';
import { EditNote } from '../components/EditNote';

export type Note = {
	id: string;
} & NoteData;

export type RawNote = {
	id: string;
} & RawNoteData;

export type RawNoteData = {
	title: string;
	markdown: string;
	tagIds: string[];
};

export type NoteData = {
	title: string;
	markdown: string;
	tags: Tag[];
};

export type Tag = {
	id: string;
	label: string;
};

function App() {
	const [notes, setNotes] = useLocalStorage<RawNote[]>('NOTES', []);
	const [tags, setTags] = useLocalStorage<Tag[]>('tags', []);

	const notesWithTags = useMemo(() => {
		return notes.map((note) => ({
			...note,
			tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
		}));
	}, [notes, tags]);

	function onCreateNote({ tags, ...data }: NoteData) {
		setNotes((prevNotes) => [
			...prevNotes,
			{ ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) },
		]);
	}

	function onUpdateNote(id: string, { tags, ...data }: NoteData) {
		setNotes((prevNotes) =>
			prevNotes.map((note) =>
				note.id === id
					? { ...note, ...data, tagIds: tags.map((tag) => tag.id) }
					: note
			)
		);
	}

	function onDeleteNote(id: string) {
		setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
	}

	function addTag(tag: Tag) {
		setTags((prev) => [...prev, tag]);
	}

	function updateTag(id: string, label: string) {
		setTags((prevTags) =>
			prevTags.map((tag) => (tag.id === id ? { ...tag, label } : tag))
		);
	}

	function deleteTag(id: string) {
		setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
	}

	return (
		<BrowserRouter>
			<Container className="my-4">
				<Routes>
					<Route
						path="/"
						element={
							<NoteList
								notes={notesWithTags}
								availableTags={tags}
								onUpdateTag={updateTag}
								onDeleteTag={deleteTag}
							/>
						}
					/>
					<Route
						path="/new"
						element={
							<NewNote
								onSubmit={onCreateNote}
								onAddTag={addTag}
								availableTags={tags}
							/>
						}
					/>
					<Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
						<Route index element={<Note onDelete={onDeleteNote} />} />
						<Route
							path="edit"
							element={
								<EditNote
									onSubmit={onUpdateNote}
									onAddTag={addTag}
									availableTags={tags}
								/>
							}
						/>
					</Route>
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</Container>
		</BrowserRouter>
	);
}

export default App;
