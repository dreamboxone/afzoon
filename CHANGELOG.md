# Changelog

## 1.0.4

- Run Apply in a background worker and return immediately instead of keeping a CGI request open throughout formatting and extroot copying.
- Poll the operation result with short requests, avoiding web-server time limits on slower USB devices.
- Prevent overlapping Apply, safe-removal and extroot-disable operations while the worker is active.
- Preserve formatting output and diagnostics, report stopped workers, and show a meaningful message for an empty router response.
- Add regression checks for delayed workers, failed operations and LuCI polling.

## 1.0.3

- Return structured errors for partition creation, formatting and UUID detection failures.
- Keep formatting output separate from the JSON response; save Apply diagnostics in `/var/run/afzoon/apply.log`.
- Allow up to ten minutes for Apply requests on slower USB devices.
- Pause status polling during Apply and remove callbacks belonging to replaced views.
- Detect extroot extraction and unmount failures.
