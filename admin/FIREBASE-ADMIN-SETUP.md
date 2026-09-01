# Kalidad Pharmacy — Firebase admin setup

## 1. Admin authentication

Admin credentials must be created in **Firebase Authentication → Users** using Email/Password authentication.

Do **not** store admin passwords in Firestore or in the GitHub repository.

The corresponding Firestore profile belongs in:

`users/{firebaseAuthUid}`

Recommended fields:

```text
firstName: "..."
lastName: "..."
email: "admin@example.com"
phone: "+256..."
role: "superadmin" | "admin" | "staff"
active: true
createdAt: server timestamp
updatedAt: server timestamp
```

The `uid` must be the Firebase Authentication user's UID. The admin login first verifies the Firebase email/password and then verifies this Firestore profile. Only `superadmin`, `admin`, and active `staff` profiles are accepted by the admin portal.

## 2. Role meaning

- `superadmin`: full administrative access.
- `admin`: normal pharmacy administration, including catalogue and order management.
- `staff`: operational access intended for day-to-day catalogue/order work.
- `customer`: public store account only; never use this role for admin access.

## 3. Product catalogue structure

Collection:

`products/{productId}`

Recommended fields:

```text
name: "Product name"
categoryId: "category-document-id"
categoryName: "Display fallback"
price: 0
salePrice: null
stock: 0
image: "Firebase Storage download URL"
description: "Product description"
featured: false
requiresPrescription: false
active: true
createdAt: server timestamp
updatedAt: server timestamp
```

Prices are stored as integer UGX amounts. `salePrice` should be `null` when there is no sale price.

## 4. Category structure

Collection:

`categories/{categoryId}`

Recommended fields:

```text
name: "Category name"
slug: "category-name"
description: "Optional description"
image: "Optional Firebase Storage download URL"
displayOrder: 1
active: true
createdAt: server timestamp
updatedAt: server timestamp
```

The admin product editor should select an active category by `categoryId`; `categoryName` is retained only as a display fallback.

## 5. Product images

Product images should ultimately live in Firebase Storage under:

`products/{productId}/...`

The Firestore `products.image` field stores the resulting download URL. This keeps product metadata in Firestore while binary image files remain in Storage.

## 6. Catalogue loading stage

The repository currently contains the Firebase catalogue/editor plumbing, but the actual Kalidad product list has not been embedded here because the authoritative product names, prices, categories, stock levels and product images have not been supplied as a catalogue dataset.

Once the authoritative catalogue is supplied, load it into `categories` first and then `products`, preserving the schema above. Do not invent prices, stock or medicine details.

## 7. Security

Firestore rules already restrict product/category writes to active staff/admin profiles. Admin passwords remain exclusively in Firebase Authentication. Firestore stores authorization/profile metadata, not passwords.
