# Changelog

## 1.0.3

- Return structured errors for partition creation, formatting and UUID detection failures.
- Keep formatting output separate from the JSON response; save Apply diagnostics in `/var/run/afzoon/apply.log`.
- Allow up to ten minutes for Apply requests on slower USB devices.
- Pause status polling during Apply and remove callbacks belonging to replaced views.
- Detect extroot extraction and unmount failures.
