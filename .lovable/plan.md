# Clear intro and rubric assessment

## What will change
- Sharpen the cinematic opening by removing heavy blur and reducing dark overlays while preserving its futuristic motion and replay control.
- Add the administrator sign-in `niraj.shah` with the supplied password, using the same secure teacher access as the existing administrator.
- Add a six-part project assessment: Planning, Practical execution, Creativity, Sustainability, Documentation, and Presentation, each scored from 0 to 10.
- Calculate and display the total automatically out of 60 before the administrator submits the review.
- Save the rubric with the project decision and show the full score breakdown and total to the student.

## Assessment behavior
- Administrators complete the rubric when approving a submitted project.
- Denied projects can be returned with written feedback without a completed score.
- Reassessing a project updates its saved rubric rather than creating duplicates.

## Technical details
- Add a protected one-to-one project assessment record with row-level access for the project owner and teachers.
- Keep administrator privileges in the existing secure teacher role system.
- Validate every rubric value as an integer from 0–10 and calculate the total from the six saved values.
- Verify both administrator accounts, project approval, automatic totals, student score visibility, and intro clarity in the running app.
