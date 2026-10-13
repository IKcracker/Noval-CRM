# Fleet imagery

The fleet panels display **real stock photography** of logistics trucks and delivery vans rather than the old hand-drawn SVG.

## Source imagery
The three photographs were sourced from Pexels under the Pexels licence, which allows commercial website use. Their source pages are:

- Box delivery truck: https://www.pexels.com/photo/a-white-truck-is-parked-on-the-side-of-the-road-28158703/
- Heavy freight truck: https://www.pexels.com/photo/white-truck-parked-on-road-11777628/
- Delivery van: https://www.pexels.com/photo/man-opening-a-door-of-a-delivery-van-6407433/

Local optimized images are saved at `public/fleet/truck-box.jpg`, `public/fleet/truck-semi.jpg`, and `public/fleet/cargo-van.jpg`. Vehicle cards use rough make/model matching for the representative category only; they do **not** depict the actual registered fleet vehicle.

When the project later supports fleet photo uploads, pass an approved local image path in `imageSrc` to `VehicleThumbnail`. The component intentionally does not accept arbitrary external sources. Missing photos display an accessible icon fallback rather than a broken image.

Pexels licence: https://www.pexels.com/license/ . Photo subjects and third-party logos do not endorse Noval Logistics.
