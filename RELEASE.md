# Release Process

This document outlines the steps to release Ripliel to the Chrome Web Store and Firefox Add-ons (AMO).

## Prerequisites

- Access to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- Access to the [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
- All tests passing: `npm test`

## Version Update

1. Update the version number in `manifest.json`:
   ```json
   "version": "X.Y.Z"
   ```

2. Commit the version change:
   ```bash
   git add manifest.json
   git commit -m "Bump version to X.Y.Z"
   git tag vX.Y.Z
   git push origin main --tags
   ```

## Build Extension Package

Create a zip file containing only the necessary files:

```bash
mkdir -p dist
zip -r dist/ripliel.zip \
  manifest.json \
  src/ \
  popup/ \
  icons/ \
  fonts/ \
  -x "*.DS_Store" -x "*__MACOSX*"
```

Verify the zip contents:
```bash
unzip -l dist/ripliel.zip
```

## Chrome Web Store Release

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

2. Select the Ripliel extension

3. Click **Package** in the left sidebar

4. Click **Upload new package** and select your zip file

5. Update the store listing if needed:
   - Description
   - Screenshots
   - Promotional images

6. Submit for review

7. Wait for approval (typically 1-3 business days)

### Chrome-Specific Notes

- Chrome uses Manifest V3 with `background.service_worker` for background scripts
- If uploading fails, check that all icons exist and are valid PNGs
- Ensure `host_permissions` are justified in the privacy practices section

## Firefox Add-ons (AMO) Release

1. Go to the [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)

2. Click **My Add-ons** and select Ripliel

3. Click **Upload New Version**

4. Upload your zip file

5. Complete the submission form:
   - **Release notes**: Describe changes in this version
   - **Source code**: Not required for this extension (no build step)

6. Submit for review

7. Wait for approval (typically 1-5 business days)

### Firefox-Specific Notes

- The manifest must include `browser_specific_settings.gecko`:
  ```json
  "browser_specific_settings": {
    "gecko": {
      "id": "ripliel@matthewfala.com",
      "strict_min_version": "109.0",
      "data_collection_permissions": {
        "required": false
      }
    }
  }
  ```

- Firefox uses `background.scripts` (array) instead of `background.service_worker`

- The `data_collection_permissions` property is required and must accurately reflect the extension's data practices

## Post-Release Checklist

- [ ] Verify the extension is live on Chrome Web Store
- [ ] Verify the extension is live on Firefox Add-ons
- [ ] Test installation from both stores
- [ ] Update any external documentation or website links
- [ ] Announce the release if applicable

## Troubleshooting

### "data_collection_permissions" error (Firefox)

Ensure `manifest.json` includes:
```json
"browser_specific_settings": {
  "gecko": {
    "data_collection_permissions": {
      "required": false
    }
  }
}
```

### Icon validation errors (Chrome)

- Ensure all icons (16x16, 48x48, 128x128) exist in the `icons/` directory
- Icons must be valid PNG files
- Regenerate if needed: `npm run generate-icons`

### Permission justification required

Both stores may ask you to justify permissions:
- `storage`: Used to save user preferences (anchor frequency, serif font toggle)
- `<all_urls>`: Required to inject content scripts on all pages where users want reading assistance
