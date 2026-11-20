# Asim Jofa
https://kamalabid380-del.github.io/Asim-Jofa/
Static marketing site for the Asim Jofa couture house — bridal, luxury pret, lawn and fine jewellery.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Bridal couture | `bridal.html` |
| Luxury pret | `pret.html` |
| Lawn | `lawn.html` |
| Jewellery | `jewellery.html` |
| Atelier (house story) | `atelier.html` |
| Boutiques & appointments | `boutiques.html` |

## Structure

```
assets/
  css/style.css      shared design system and layout
  js/main.js         nav, scroll reveal, filters, shopping bag, forms
  images/            generated campaign and catalogue imagery
```

No build step and no dependencies — open `index.html` directly, or serve the folder:

```
npx serve .
```

## Features

- Responsive layout with a full-screen mobile menu
- Collection filters that work in place (no page reload)
- Client-side shopping bag with quantity editing, stored in `localStorage`
- Appointment and newsletter forms with inline validation
- Scroll-reveal animations, paused automatically for `prefers-reduced-motion`

## Notes

Product names, prices and boutique details are sample content for presentation purposes.
