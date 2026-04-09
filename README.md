# z13ctl Vicinae Extension

RGB lighting and system control for ASUS ROG Flow Z13 2025 via the [z13ctl](https://github.com/dahui/z13ctl) CLI.

## Commands

| Command | Description |
|---------|-------------|
| `z13ctl` | Status dashboard with quick actions |
| `z13ctl-lighting` | RGB lighting mode and color control |
| `z13ctl-lighting-presets` | Quick RGB presets |
| `z13ctl-power` | Performance profile, TDP, battery limit |
| `z13ctl-undervolt` | CPU Curve Optimizer undervolt |
| `z13ctl-fans` | View fan curves, reset to auto |
| `z13ctl-fans-edit` | Edit custom 8-point fan curves |

## Requirements

- [z13ctl](https://github.com/dahui/z13ctl) installed and in PATH
- `z13ctl setup` must have been run (grants udev permissions)
- ROG Flow Z13 2025 (or compatible ASUS device)

## Development

```bash
npm install
npm run dev    # run in Vicinae dev mode
npm run build  # production build
```

## License

MIT
