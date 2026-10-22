# Dichroic Beamsplitter: Code-Driven Anatomy Motion Explainer

**GitHub About (1-line):** Deterministic 34s (1,020-frame @ 30fps) code-driven anatomy explainer of a Dichroic Beamsplitter grounded in thin-film interference physics, with interactive cutaway stage and SEO-optimized Medium article.

**GitHub Topics:** `dichroic-beamsplitter`, `precision-optics`, `thin-film-interference`, `anatomy-explainer`, `motion-design`, `optical-engineering`, `typescript`, `vite`, `scientific-visualization`, `edmund-optics`

---

## Live Preview & Standalone Artifacts

- **GitHub Pages Live Application:** `https://mizcausevic-dev.github.io/dichroic-beamsplitter-explainer/`
- **Standalone Zero-Dependency Schematic (`visualization-Cursor.html`):** `./visualization-Cursor.html`
- **7-Theme Product & Governance Dashboard (`dashboard-Cursor.html` / `dashboard-Claude.html`):** `./dashboard-Cursor.html`
- **Full SEO/GEO/AEO Medium Feature Article:** `./dichroic-beamsplitter-medium-article-Cursor.md`

---

## Architecture & Timeline Specification

- **Vertical:** Precision Optical Components
- **Duration:** `34.00` seconds at `30` fps (`1,020` deterministic frames indexed `0–1019`)
- **Visual Direction:**
  - Technical Stage: `#0B1019`
  - Primary Transport / Short-$\lambda$ Signal Channel: Cyan `#00E5FF`
  - Energy / Actuation / Long-$\lambda$ Channel: Gold `#FFD166`
  - Dielectric Stack / Phase / Boundary Control Overlays: Violet `#9D4EDD`

### 5-Act Camera & Causal Timing Matrix

| Act | Frame Window | Time Window | Stage Focus & Camera Choreography |
| :--- | :--- | :--- | :--- |
| **Act 1** | `0–149` | `0–5s` | **Reveal Mixed Wavelengths:** Establish complete optical assembly and perform a slow three-quarter push toward the active $45^\circ$ dichroic region. |
| **Act 2** | `150–299` | `5–10s` | **Selected Spectral Response:** Sectional cutaway into the alternating $n_H / n_L$ quarter-wave stack ($n \cdot d \cdot \cos\theta = \lambda_0 / 4$); retain nearby substrate connections for orientation. |
| **Act 3** | `300–509` | `10–17s` | **Separate Wavelength Paths:** Track orthogonal $90^\circ$ stopband reflection vs. $0^\circ$ passband transmission, including plate Snell walk-off ($\Delta s$) and rear AR coating. |
| **Act 4** | `510–749` | `17–25s` | **Compare Incident & Output Spectra:** Follow qualitative $R(\lambda)$ and $T(\lambda)$ spectral transfer curves, finite cutoff transition slope, passband ripple, and energy conservation. |
| **Act 5** | `750–1019` | `25–34s` | **Mark Design Dependence:** Pull back to a stable complete-system view highlighting AOI blue-shift, $s/p$ polarization splitting, and plate vs. cube operational boundaries. |

---

## Running Locally

```bash
npm install
npm run dev -- --port 43189
```

To typecheck, lint, and build the production bundle:

```bash
npm run lint
npm run build
```

---

## Reference Starting Points & Scope

- [Edmund Optics: What Are Beamsplitters?](https://www.edmundoptics.com/knowledge-center/application-notes/optics/what-are-beamsplitters/)
- [Edmund Optics: Introduction to Optical Prisms](https://www.edmundoptics.com/knowledge-center/application-notes/optics/introduction-to-optical-prisms/)

*Reference Scope:* These sources introduce the architecture and mechanism; they do not independently validate every animation choice or any implementation-specific performance. Verify a selected product and publication claims against manufacturer documentation before release.
