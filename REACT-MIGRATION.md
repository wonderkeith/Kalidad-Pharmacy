# Kalidad Pharmacy React migration

This branch migrates the website entry point to a Vite + React single-page application.

## Stack
- React 19
- React Router 7
- Firebase Web SDK 12
- Lucide React icons
- Vite 7
- Vercel Analytics

## Routes
Public: `/`, `/about`, `/services`, `/wellness`, `/news`, `/careers`, `/contact`.
Store: `/store`, `/store/product/:id`, `/store/cart`, `/store/checkout`, `/store/login`, `/store/account`.
Admin: `/admin/login`, `/admin`, `/admin/products`, `/admin/product-edit`, `/admin/orders`, `/admin/customers`, `/admin/content`.

## Firebase
The React app reads the existing Firebase project and existing Firestore collections. Product catalogue reads come from `products`; admin access is checked against `users/{uid}` with the existing `admin`, `superadmin`, and `staff` roles.

## Important
The existing HTML/CSS/JS files are intentionally retained during this migration as a rollback/reference layer. The React app is now the root application entry point on this branch. Do not merge this branch into `main` until the full visual regression, Firebase catalogue, image upload, customer checkout, and order-management tests pass.
