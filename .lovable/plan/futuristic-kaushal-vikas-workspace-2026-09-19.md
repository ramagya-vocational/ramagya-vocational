# Futuristic Kaushal Vikas workspace

## What will change
- Restyle the public, student, project, and teacher screens to match the selected futuristic workspace direction.
- Use the chosen Workshop Blue palette with Sora headings and Manrope body text, while keeping the Ramagya crest and school identity prominent.
- Add the uploaded *Kaushal Vikas* Grade 9 book to the app and preload its 12 chapters under the three units from the official contents page.
- Add a visible book library area with chapter details and an in-app “Open textbook” action.
- Complete the student review flow so projects and progress updates can be sent to the teacher, with decisions and feedback shown to students.
- Preserve section-based teacher browsing, chapter assignment, progress tracking, and approval/denial controls.

## Experience
- Build a cinematic first screen around the generated vocational lab photograph, crisp blue/amber lighting, technical labels, and tactile controls.
- Use a bento-style workspace for chapter cards, projects, progress, and teacher review queues.
- Add restrained light sweeps, elevation, press feedback, progress animation, and clear focus states; reduced-motion preferences remain supported.
- Keep layouts usable on phones and desktops without overlapping or truncated text.

## Technical details
- Store the uploaded PDF through the app’s asset system and reference its stable URL.
- Add chapter seed data in a database migration without overwriting teacher-created work.
- Update semantic design tokens globally rather than hardcoding colors in page elements.
- Keep current authentication and data-access protections intact.
- Verify the public page, student sign-in/workflow, teacher account, section lists, chapter data, and review actions in the running app.
