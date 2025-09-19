# Project: prismafy

**Vision:** To be the most intuitive and educational tool for developers and designers to create beautiful, accessible, and technically sound color palettes. `prismafy` turns a single color idea into a complete, ready-to-use UI color system in seconds.

---

## 1. Core Features & User Flow

`prismafy` is a Single Page Application (SPA) that guides the user through a seamless experience across three main features:

- **The Guide:** An educational section explaining the "what" and "why" of UI color palettes.
- **The Creator:** An interactive, step-by-step tool to generate a full color palette from a single color.
- **The Visualizer:** A real-time tool to apply a generated (or any) palette to existing websites.

### User Flow Diagram:

1.  **Landing (Home View)**
    - User learns about `prismafy`'s purpose.
    - Reads brief intros to the Guide, Creator, and Visualizer.
    - Clicks the main Call-to-Action (CTA): "Create Your Palette".

2.  **Creation (Creator View)**
    - **Step A: Choose Primary Color:** The user selects a single base color using a color picker or by inputting a value (HEX, RGB, HSL).
    - **Step B: Select Harmony:** The application instantly generates previews of 6 different color harmonies (Analogous, Complementary, etc.) based on the primary color. The user selects the harmony that best fits their brand's feel.
    - **Step C: View & Export:** The application generates and displays the complete palette:
      - Primary Color (with tints & shades)
      - Secondary/Support Colors (with tints & shades)
      - Neutral Colors (with tints & shades)
    - The user can copy individual color codes, export the full palette (as CSS variables, JSON, etc.), and click a CTA to "Visualize this Palette".

3.  **Visualization (Visualizer View)**
    - The user arrives from the Creator (palette pre-loaded) or navigates directly.
    - The interface shows the current palette on one side.
    - The user enters a URL of any website into an input field.
    - The application loads that website into an `iframe` and injects the palette's CSS variables, overriding the site's original colors to preview the new theme in real-time.

---

## 2. Application Architecture & Page Breakdown

As an SPA, `prismafy` will render different components dynamically into the main layout without page reloads.

### Global Components:

- **Header:**
  - Logo and "prismafy" name on the top-left. (There is no Logo yet)
  - Navigation links: `Home`, `Guide`, `Create`, `Visualizer`.

### Page/View Components:

- **Home View:**
  - **Hero Section:** Engaging headline ("From a single color to a full UI palette in 60 seconds."), brief description, and the primary "Create Your Palette" CTA.
  - **Features Section:** Three distinct cards explaining the purpose of the Guide, Creator, and Visualizer.

- **Guide View:**
  - A well-structured educational page.
  - **Section 1: The Anatomy of a Palette:** Explains the roles of Primary (Brand), Secondary (Support), and Neutral colors with clear visual examples (e.g., screenshots of buttons, alerts, text).
  - **Section 2: The Magic of Harmony:** Visually explains each of the 6 color harmonies with interactive color wheels.
  - **Section 3: Accessibility Matters:** A simple explanation of color contrast and its importance, linking to WCAG standards.

- **Creator View:**
  - A multi-step interface within a single component.
  - **State 1 - Primary Selection:** A large, focused UI with a color picker component and text inputs.
  - **State 2 - Harmony Selection:** The UI updates to show 6 preview cards. Each card displays the base colors of that harmony. On hover, the cards could have a subtle animation.
  - **State 3 - Palette Display:** The main view is a grid displaying the full palette. Each color family (Primary, Success, Warning, Error, Info, Neutral) is a row, with its 9-step shade scale shown horizontally.
    - Each color swatch will have a "copy" icon.
    - An "Export" button will open a modal with options (CSS, SCSS, JSON).
    - A prominent "Visualize this Palette" button.

- **Visualizer View (New Feature):**
  - **Layout:** A two-column layout.
  - **Left Column (Control Panel):** Displays the current color palette. Users can paste in a different palette's JSON structure to change it.
  - **Right Column (Preview):** An input bar for a URL and a large `iframe` below it. When the user submits a URL, JavaScript will be used to inject styles into the `iframe`'s head to preview the theme.
    - _Technical Note:_ This may be limited by the target website's `X-Frame-Options` header (CORS policy). The UI should gracefully handle cases where a site cannot be embedded.

---

## 3. The `prismafy` Color Generation Engine

This is the core logic that powers the Creator. It's a refined, algorithmic version of the provided color system.

**Input:** A single base color (in HSL format for easy manipulation).

1.  **Step 1: Define Primary Color:** The user's input is set as the `primary-500` base.

2.  **Step 2: Generate Harmony Base Colors:** Based on the user's chosen harmony, the system calculates the base hues for the secondary colors.
    - The system then intelligently assigns these colors to the support roles (`success`, `warning`, `error`, `info`). For example, it will find the calculated hue closest to green and assign it to `success`. Saturation and brightness are kept consistent with the primary color, as per the best practice.

3.  **Step 3: Generate Full Shade Scales:** The system programmatically applies the 9-step tint/shade generation process to **every base color** (Primary, Success, Warning, Error, Info).
    - This process will be a reusable function that takes a base color and returns an array of 9 colors from 100 to 900.

4.  **Step 4: Generate Neutral Scale:**
    - A base neutral grey is defined (e.g., `hsl(primaryHue, 6%, 50%)`).
    - **Refinement:** The neutral scale will be subtly tinted with the primary color's hue. This creates a more sophisticated and cohesive palette than a pure grayscale.
    - The 9-step shade generation process is applied to this tinted grey base.

5.  **Step 5: Automated Accessibility Check:**
    - For every generated color, the system calculates its contrast ratio against key colors (e.g., `neutral-100` for light BG, `neutral-900` for dark BG).
    - Each color swatch in the UI will display a small badge indicating its WCAG 2.1 contrast compliance (AA or AAA) for normal and large text.

**Output:** A structured JSON object representing the entire palette, ready for export.

---

## 4. Design System & Aesthetics

The visual identity of `prismafy` will be modern, clean, and engaging.

- **Theme:** Dark theme first.
- **Core Style:** Frosted Glass / Glassmorphism.
  - **CSS:** `background: rgba(40, 40, 40, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1);`
- **Interactivity:** Animated gradients will be used as accents.
  - **Example:** On buttons, a subtle rainbow-colored radial gradient can appear behind the element on hover, illuminating the frosted glass borders.
- **Typography:** A clean, sans-serif font (like Inter or Manrope) with high contrast (white or light grey text on dark backgrounds).
- **Layout:** Generous use of white space (or "dark space") to keep the focus on the content and colors.

---

## 5. Defined Tech Stack

This project will be built using a modern, performant, and developer-friendly tech stack designed for creating rich user interfaces.

- **Core Framework & Build Tool:** **Vite + React**
  - **Why:** Vite provides a lightning-fast development server and optimized build process. React's component-based architecture is perfect for managing the application's different views and interactive elements.

- **Styling:** **Tailwind CSS 4**
  - **Why:** A utility-first CSS framework that allows for rapid implementation of the custom design system (frosted glass, gradients) directly in the markup, ensuring consistency and maintainability.
