Complete MVP for Addresses Page Redesign
Structure + UI + UX
🎯 ADDRESSES PAGE PURPOSE

Goals:

    Allow users to manage multiple shipping addresses
    Allow users to manage billing addresses
    Enable easy add, edit, and delete of addresses
    Set default addresses for faster checkout
    Provide clear distinction between shipping and billing
    Support multiple address formats

User Intent:

    "I want to add a new delivery address"
    "I need to update my address"
    "I want to set a default shipping address"
    "I need to add a billing address"
    "I want to delete an old address"

Users:

    Registered customers
    Users with multiple delivery locations
    Business customers (different billing/shipping)

🎨 UI DESIGN SYSTEM (Addresses Page Specific)
Color Usage
Element	Color
Page background	Off-white #FAF9F6
Address cards	White #FFFFFF
Default badge	Gold #D4A017
Shipping icon	Blue #2196F3
Billing icon	Green #43A047
Add button	Gold #D4A017
Edit button	Grey outline
Delete button	Red #E53935 (on hover)
Card border (default)	Gold #D4A017
Card border (normal)	Light grey #E5E5E5
Form inputs	White with grey border
Input focus	Gold border #D4A017
Success toast	Green #43A047
Error state	Red #E53935
Addresses Page Typography
Element	Font	Size Desktop	Size Mobile
Page title	Poppins Bold	36px	28px
Section title	Poppins SemiBold	24px	20px
Address name	Poppins SemiBold	18px	16px
Address details	Inter Regular	15px	14px
Badge text	Poppins SemiBold	11px	10px
Button text	Poppins Medium	14px	14px
Form labels	Inter Medium	14px	14px
Form inputs	Inter Regular	16px	16px
Helper text	Inter Regular	13px	12px
Empty state title	Poppins SemiBold	20px	18px
Empty state text	Inter Regular	15px	14px
📐 PAGE STRUCTURE
Overall Layout

text

┌─────────────────────────────────────┐
│         NAVIGATION BAR              │
├─────────────────────────────────────┤
│                                     │
│         HEADER                      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     SHIPPING ADDRESSES SECTION      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     BILLING ADDRESSES SECTION       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     HELP / INFO SECTION             │
│                                     │
├─────────────────────────────────────┤
│         FOOTER                      │
└─────────────────────────────────────┘

📍 SECTION-BY-SECTION BREAKDOWN
SECTION 1: HEADER

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Home > My Account > Addresses              (Breadcrumb)    │
│                                                             │
│                                                             │
│                    My Addresses                             │
│                                                             │
│     Manage your shipping and billing addresses for          │
│     faster checkout.                                        │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

UI Specs:

text

Background: White or light gradient
Height: 200-220px desktop, 150-180px mobile
Padding: 60px top, 40px bottom
Text-align: Center

Breadcrumb:
- Font: 14px Inter
- Color: Grey, links in gold
- Margin-bottom: 24px

Title:
- Font: 36px Poppins Bold
- Color: Deep Green #1B4332

Subtitle:
- Font: 16px Inter Regular
- Color: #666666
- Margin-top: 12px
- Max-width: 500px

SECTION 2: SHIPPING ADDRESSES SECTION

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📦 Shipping Addresses                    [+ Add New]     │
│                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   │ ★ DEFAULT       │  │                 │  │      ＋        │
│   │                 │  │                 │  │                │
│   │ Ram Sharma      │  │ Office Address  │  │    Add New    │
│   │ 9801234567      │  │ 9807654321      │  │   Address     │
│   │                 │  │                 │  │                │
│   │ Kathmandu-15    │  │ Bhaktapur-5     │  │                │
│   │ Bagmati, Nepal  │  │ Bagmati, Nepal  │  │                │
│   │                 │  │                 │  │                │
│   │ [Edit] [Delete] │  │ [Edit] [Delete] │  │                │
│   │ [Set Default]   │  │ [Set Default]   │  │                │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘

Section Header:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📦 Shipping Addresses (3)                [+ Add New]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Left side:
- Icon: 📦 Package/Truck icon
- Title: "Shipping Addresses"
- Count: "(3)" in grey

Right side:
- Add button: "+ Add New"

UI Specs:
- Display: Flex
- Justify-content: Space-between
- Align-items: Center
- Margin-bottom: 24px

Icon:
- Size: 24px
- Color: Blue #2196F3
- Margin-right: 12px

Title:
- Font: 24px Poppins SemiBold
- Color: #333333

Count:
- Font: 18px Inter Regular
- Color: #999999

Add button:
- Background: Gold #D4A017
- Color: White
- Padding: 12px 24px
- Border-radius: 8px
- Icon: + (plus)
- Font: 14px Poppins Medium
- Hover: Darker gold, slight lift

ADDRESS CARD DESIGN (Most Important!)

Default Address Card:

text

┌─────────────────────────────────────┐
│ [★ DEFAULT]                    [···]│ ← Badge + More menu
│                                     │
│  Ram Sharma                         │ ← Name (bold)
│  +977-9801234567                    │ ← Phone
│                                     │
│  Koteshwor-15                       │ ← Street/Area
│  Near City Hospital                 │ ← Landmark
│  Kathmandu, Bagmati                 │ ← City, State
│  Nepal - 44600                      │ ← Country, Postal
│                                     │
│  ─────────────────────────────────  │ ← Divider
│                                     │
│  [✏️ Edit]        [🗑️ Delete]       │ ← Actions
│                                     │
└─────────────────────────────────────┘

Regular Address Card:

text

┌─────────────────────────────────────┐
│  Home                          [···]│ ← Label + More menu
│                                     │
│  Sita Sharma                        │
│  +977-9807654321                    │
│                                     │
│  Suryabinayak-5                     │
│  Near Kal Kal Factory               │
│  Bhaktapur, Bagmati                 │
│  Nepal - 44800                      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [✏️ Edit]  [⭐ Set Default]  [🗑️]  │
│                                     │
└─────────────────────────────────────┘

Add New Address Card:

text

┌─────────────────────────────────────┐
│                                     │
│                                     │
│              ┌─────┐                │
│              │  +  │                │
│              └─────┘                │
│                                     │
│        Add New Address              │
│                                     │
│   Add a new shipping address        │
│   for your deliveries               │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘

UI Specs for Address Card:

text

Card container:
- Background: White
- Border: 2px solid #E5E5E5 (normal)
- Border: 2px solid Gold #D4A017 (default)
- Border-radius: 16px
- Padding: 24px
- Min-height: 280px
- Position: Relative
- Transition: All 0.3s ease

Default badge:
┌────────────────┐
│  ★ DEFAULT     │
└────────────────┘
- Position: Top left (inside card)
- Background: Gold #D4A017
- Color: White
- Padding: 6px 14px
- Border-radius: 4px
- Font: 11px Poppins SemiBold
- Text-transform: Uppercase

Label badge (Home, Office, etc.):
┌────────────────┐
│  🏠 Home       │
└────────────────┘
- Background: Light grey #F5F5F5
- Color: #666666
- Padding: 6px 14px
- Border-radius: 4px
- Font: 13px Inter Medium

More menu (•••):
- Position: Top right
- Size: 32px x 32px
- Background: Transparent (hover: #F5F5F5)
- Border-radius: 50%
- Icon: Three dots vertical

Name:
- Font: 18px Poppins SemiBold
- Color: #333333
- Margin-top: 16px (if badge exists)

Phone:
- Font: 15px Inter Regular
- Color: #666666
- Margin-top: 4px

Address lines:
- Font: 15px Inter Regular
- Color: #666666
- Line-height: 1.6
- Margin-top: 16px

Divider:
- Height: 1px
- Background: #EEEEEE
- Margin: 20px 0

Action buttons container:
- Display: Flex
- Gap: 12px
- Justify-content: Space-between (or flex-start)

Edit button:
- Background: Transparent
- Border: 1.5px solid #E0E0E0
- Color: #666666
- Padding: 10px 20px
- Border-radius: 8px
- Icon: ✏️ Pencil
- Hover: Border gold, color gold

Delete button:
- Background: Transparent
- Border: 1.5px solid #E0E0E0
- Color: #666666
- Padding: 10px 20px
- Border-radius: 8px
- Icon: 🗑️ Trash
- Hover: Border red, color red, background light red

Set Default button:
- Background: Transparent
- Border: 1.5px solid #E0E0E0
- Color: #666666
- Padding: 10px 20px
- Border-radius: 8px
- Icon: ⭐ Star
- Hover: Border gold, color gold

Card Hover State:

text

Normal → Hover:
- Shadow: 0 4px 20px rgba(0,0,0,0.08) → 0 10px 30px rgba(0,0,0,0.12)
- Transform: translateY(-4px)
- Border color slightly darker (if not default)

Add New Card UI:

text

Card:
- Background: White
- Border: 2px dashed #D4A017
- Border-radius: 16px
- Display: Flex
- Flex-direction: Column
- Align-items: Center
- Justify-content: Center
- Cursor: Pointer
- Min-height: 280px

Plus icon container:
- Width: 60px
- Height: 60px
- Background: Light gold #FDF6E3
- Border-radius: 50%
- Display: Flex
- Align-items: Center
- Justify-content: Center

Plus icon:
- Size: 28px
- Color: Gold #D4A017

Title:
- Font: 18px Poppins SemiBold
- Color: #333333
- Margin-top: 20px

Subtitle:
- Font: 14px Inter Regular
- Color: #666666
- Margin-top: 8px
- Text-align: Center

Hover:
- Background: #FFFDF5 (very light gold tint)
- Border: 2px dashed (darker gold)
- Plus icon: Scale 1.1

Grid Layout:

text

Container:
- Display: Grid
- Grid-template-columns: repeat(3, 1fr) (desktop)
- Gap: 24px
- Margin-bottom: 60px

Responsive:
- Desktop (1024px+): 3 columns
- Tablet (768px-1023px): 2 columns
- Mobile (<768px): 1 column

SECTION 3: BILLING ADDRESSES SECTION

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   💳 Billing Addresses                     [+ Add New]     │
│                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   │ ★ DEFAULT       │  │                 │  │      ＋        │
│   │                 │  │ Company         │  │                │
│   │ Ram Sharma      │  │ Kal Kal Group   │  │    Add New    │
│   │ 9801234567      │  │ 01-6619673      │  │   Address     │
│   │                 │  │                 │  │                │
│   │ Kathmandu-15    │  │ Bhaktapur-5     │  │                │
│   │ Bagmati, Nepal  │  │ Bagmati, Nepal  │  │                │
│   │                 │  │                 │  │                │
│   │ [Edit] [Delete] │  │ [Edit] [Delete] │  │                │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘
│                                                             │
│   ☐ Use shipping address as billing address                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Section Header (Billing):

text

Icon: 💳 Credit card icon
Color: Green #43A047
Title: "Billing Addresses"

Same layout as shipping section

Use Shipping as Billing Checkbox:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ☐ Use my default shipping address for billing            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Checkbox:
- Size: 22px x 22px
- Border: 2px solid #E0E0E0
- Border-radius: 4px
- Checked: Gold background, white checkmark

Label:
- Font: 15px Inter Regular
- Color: #666666
- Cursor: Pointer

Container:
- Margin-top: 24px
- Padding: 16px 20px
- Background: Light grey #F5F5F5
- Border-radius: 8px

SECTION 4: ADD/EDIT ADDRESS MODAL

Modal Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                        [✕]  │
│                                                             │
│              Add New Shipping Address                       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Address Label (Optional)                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ e.g., Home, Office, Parents' House                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Full Name *                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Ram Sharma                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Phone Number *                                             │
│  ┌───────┐ ┌───────────────────────────────────────────┐   │
│  │ +977  │ │ 9801234567                                │   │
│  └───────┘ └───────────────────────────────────────────┘   │
│                                                             │
│  Street Address *                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Koteshwor-15, Near City Hospital                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Landmark (Optional)                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Opposite to ABC Bank                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  City *                          State/Province *           │
│  ┌─────────────────────────┐    ┌─────────────────────────┐ │
│  │ Kathmandu           ▼  │    │ Bagmati              ▼  │ │
│  └─────────────────────────┘    └─────────────────────────┘ │
│                                                             │
│  Country *                       Postal Code                │
│  ┌─────────────────────────┐    ┌─────────────────────────┐ │
│  │ Nepal               ▼  │    │ 44600                   │ │
│  └─────────────────────────┘    └─────────────────────────┘ │
│                                                             │
│  ☐ Set as default shipping address                         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│              [Cancel]            [Save Address]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Form Fields:
Field	Type	Required	Validation
Address Label	Text	No	Max 50 chars
Full Name	Text	Yes	Min 2 chars
Phone Number	Tel	Yes	Valid Nepal format
Street Address	Text	Yes	Min 5 chars
Landmark	Text	No	Max 100 chars
City	Dropdown/Text	Yes	Select or type
State/Province	Dropdown	Yes	Select from list
Country	Dropdown	Yes	Default: Nepal
Postal Code	Text	No	Numeric, 5 digits
Set as Default	Checkbox	No	-

Nepal Cities Dropdown Options:

text

- Kathmandu
- Pokhara
- Lalitpur
- Bhaktapur
- Biratnagar
- Birgunj
- Dharan
- Butwal
- Other (type manually)

Nepal Provinces:

text

- Province 1 (Koshi)
- Madhesh Province
- Bagmati Province
- Gandaki Province
- Lumbini Province
- Karnali Province
- Sudurpashchim Province

Modal UI Specs:

text

Overlay:
- Background: rgba(0,0,0,0.5)
- Backdrop-filter: blur(4px)

Modal container:
- Width: 600px (max)
- Max-height: 90vh
- Background: White
- Border-radius: 20px
- Shadow: 0 25px 60px rgba(0,0,0,0.3)
- Overflow-y: Auto
- Padding: 40px

Close button:
- Position: Top right (24px from edges)
- Size: 40px x 40px
- Background: #F5F5F5
- Border-radius: 50%
- Icon: ✕
- Hover: Background darker

Title:
- Font: 28px Poppins SemiBold
- Color: #333333
- Margin-bottom: 8px

Divider:
- Height: 1px
- Background: #EEEEEE
- Margin: 24px 0

Form labels:
- Font: 14px Inter Medium
- Color: #333333
- Margin-bottom: 8px
- Required indicator: * in red

Form inputs:
- Height: 52px
- Background: #FAFAFA
- Border: 1.5px solid #E0E0E0
- Border-radius: 10px
- Padding: 16px
- Font: 16px Inter Regular
- Margin-bottom: 20px

Input focus:
- Border: 2px solid Gold #D4A017
- Background: White
- Shadow: 0 0 0 4px rgba(212,160,23,0.1)

Input error:
- Border: 2px solid Red #E53935
- Background: #FFF5F5

Error message:
- Font: 13px Inter Regular
- Color: Red #E53935
- Margin-top: -16px
- Margin-bottom: 16px

Two-column layout (City/State, Country/Postal):
- Display: Grid
- Grid-template-columns: 1fr 1fr
- Gap: 20px

Dropdown:
- Same as input styling
- Custom arrow icon
- Options list with hover states

Checkbox (Set as default):
- Size: 22px x 22px
- Border: 2px solid #E0E0E0
- Border-radius: 4px
- Checked: Gold background, white checkmark
- Label: 15px Inter Regular

Button container:
- Display: Flex
- Gap: 16px
- Justify-content: Flex-end
- Margin-top: 32px

Cancel button:
- Background: Transparent
- Border: 1.5px solid #E0E0E0
- Color: #666666
- Padding: 14px 32px
- Border-radius: 10px
- Font: 16px Poppins Medium

Save button:
- Background: Gold #D4A017
- Color: White
- Padding: 14px 32px
- Border-radius: 10px
- Font: 16px Poppins Medium
- Shadow: 0 4px 15px rgba(212,160,23,0.3)

Edit Mode Differences:

text

Title: "Edit Shipping Address" (instead of Add)
Fields: Pre-filled with existing data
Button: "Save Changes" (instead of Save Address)
Additional: Show last updated date

SECTION 5: DELETE CONFIRMATION MODAL

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         ⚠️                                  │
│                                                             │
│              Delete This Address?                           │
│                                                             │
│     Are you sure you want to delete this address?           │
│     This action cannot be undone.                           │
│                                                             │
│     ┌───────────────────────────────────────────────┐       │
│     │  Ram Sharma                                   │       │
│     │  Koteshwor-15, Near City Hospital             │       │
│     │  Kathmandu, Bagmati, Nepal                    │       │
│     └───────────────────────────────────────────────┘       │
│                                                             │
│              [Cancel]            [Delete Address]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

UI Specs:

text

Modal:
- Width: 450px
- Background: White
- Border-radius: 20px
- Padding: 40px
- Text-align: Center

Warning icon:
- Size: 64px
- Color: Red #E53935 or Orange #FF9800
- Margin-bottom: 24px

Title:
- Font: 24px Poppins SemiBold
- Color: #333333

Description:
- Font: 16px Inter Regular
- Color: #666666
- Margin: 12px 0 24px

Address preview box:
- Background: #F5F5F5
- Border-radius: 12px
- Padding: 20px
- Text-align: Left
- Font: 14px Inter Regular
- Color: #666666

Cancel button:
- Outline style
- Color: #666666

Delete button:
- Background: Red #E53935
- Color: White
- Hover: Darker red

SECTION 6: SET DEFAULT CONFIRMATION

Quick Action (No Modal):

text

When user clicks "Set as Default":
1. Show loading state on button
2. API call to set default
3. Update UI immediately
4. Show success toast: "Default address updated"

Toast Notification:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ✓  Default shipping address updated successfully         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Position: Top right or bottom center
Duration: 3 seconds
Auto-dismiss with progress bar
Close button (optional)

SECTION 7: EMPTY STATE

No Shipping Addresses:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📦 Shipping Addresses                                     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │                       📍                            │   │
│   │                                                     │   │
│   │            No Shipping Addresses Yet                │   │
│   │                                                     │   │
│   │   Add your first shipping address to make           │   │
│   │   checkout faster and easier.                       │   │
│   │                                                     │   │
│   │              [+ Add Shipping Address]               │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

UI Specs:

text

Container:
- Background: White
- Border: 2px dashed #E0E0E0
- Border-radius: 16px
- Padding: 60px 40px
- Text-align: Center

Icon:
- Size: 60px
- Color: Gold #D4A017 (or grey)
- Opacity: 0.7

Title:
- Font: 20px Poppins SemiBold
- Color: #333333
- Margin-top: 20px

Description:
- Font: 15px Inter Regular
- Color: #666666
- Margin: 12px 0 24px
- Max-width: 350px

Button:
- Primary gold style
- Padding: 14px 28px

SECTION 8: MORE MENU (•••) DROPDOWN

Structure:

text

┌────────────────────────┐
│  ✏️  Edit Address      │
│  ─────────────────────  │
│  ⭐  Set as Default    │
│  ─────────────────────  │
│  📋  Copy Address      │
│  ─────────────────────  │
│  🗑️  Delete Address    │
└────────────────────────┘

UI Specs:

text

Dropdown container:
- Position: Absolute (below trigger)
- Background: White
- Border-radius: 12px
- Shadow: 0 10px 40px rgba(0,0,0,0.15)
- Min-width: 200px
- Padding: 8px 0
- Z-index: High

Menu item:
- Padding: 12px 20px
- Font: 14px Inter Regular
- Color: #333333
- Cursor: Pointer
- Display: Flex
- Align-items: Center
- Gap: 12px

Icon:
- Size: 18px
- Color: #666666

Hover:
- Background: #F5F5F5

Delete item:
- Color: Red #E53935
- Hover: Background light red #FFEBEE

Divider:
- Height: 1px
- Background: #EEEEEE
- Margin: 4px 16px

SECTION 9: HELP / INFO SECTION

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   💡 Address Tips                                           │
│                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   │                 │  │                 │  │                 │
│   │  📍 Accurate    │  │  📞 Reachable   │  │  🏠 Landmark    │
│   │  Address        │  │  Phone          │  │                 │
│   │                 │  │                 │  │                 │
│   │ Include ward    │  │ Provide a phone │  │ Add a nearby    │
│   │ number and      │  │ number where    │  │ landmark for    │
│   │ tole name       │  │ you can be      │  │ easier delivery │
│   │                 │  │ reached         │  │                 │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘

UI Specs:

text

Section:
- Background: Light gold #FDF6E3 or grey #F5F5F5
- Border-radius: 16px
- Padding: 40px
- Margin-top: 40px

Title:
- Font: 20px Poppins SemiBold
- Color: #333333
- Margin-bottom: 24px
- Icon: 💡 Lightbulb

Tips grid:
- Display: Grid
- Columns: 3 (desktop), 1 (mobile)
- Gap: 24px

Tip card:
- Background: White
- Border-radius: 12px
- Padding: 24px
- Text-align: Center

Tip icon:
- Size: 40px
- Margin-bottom: 16px

Tip title:
- Font: 16px Poppins SemiBold
- Color: #333333
- Margin-bottom: 8px

Tip description:
- Font: 14px Inter Regular
- Color: #666666
- Line-height: 1.5

📱 MOBILE ADDRESSES PAGE
Mobile Layout

text

┌─────────────────────┐
│    NAVIGATION       │
├─────────────────────┤
│                     │
│   My Addresses      │
│                     │
├─────────────────────┤
│                     │
│ 📦 Shipping (2)     │
│        [+ Add]      │
│                     │
├─────────────────────┤
│  ┌───────────────┐  │
│  │ ★ DEFAULT     │  │
│  │               │  │
│  │ Ram Sharma    │  │
│  │ 9801234567    │  │
│  │               │  │
│  │ Kathmandu...  │  │
│  │               │  │
│  │ [Edit] [···]  │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Office        │  │
│  │               │  │
│  │ Office Addr   │  │
│  │ ...           │  │
│  │               │  │
│  │ [Edit] [···]  │  │
│  └───────────────┘  │
│                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─┐  │
│  │     + Add    │   │
│  └ ─ ─ ─ ─ ─ ─ ─┘  │
│                     │
├─────────────────────┤
│                     │
│ 💳 Billing (1)      │
│        [+ Add]      │
│                     │
├─────────────────────┤
│  ┌───────────────┐  │
│  │ ★ DEFAULT     │  │
│  │ ...           │  │
│  └───────────────┘  │
│                     │
├─────────────────────┤
│   Address Tips      │
├─────────────────────┤
│     FOOTER          │
└─────────────────────┘

Mobile Card

text

┌─────────────────────────────┐
│ [★ DEFAULT]           [···] │
│                             │
│  Ram Sharma                 │
│  +977-9801234567            │
│                             │
│  Koteshwor-15               │
│  Near City Hospital         │
│  Kathmandu, Bagmati         │
│  Nepal - 44600              │
│                             │
│  ───────────────────────    │
│                             │
│  [✏️ Edit]    [🗑️ Delete]   │
│                             │
└─────────────────────────────┘

- Full width
- Same styling as desktop
- Stack vertically
- Swipe actions (optional):
  - Swipe left to reveal Delete
  - Swipe right to reveal Edit

Mobile Add/Edit Form

Full Page (Not Modal):

text

┌─────────────────────┐
│ ← Add Shipping      │ ← Back arrow + title
│   Address           │
├─────────────────────┤
│                     │
│ Address Label       │
│ ┌─────────────────┐ │
│ │ Home            │ │
│ └─────────────────┘ │
│                     │
│ Full Name *         │
│ ┌─────────────────┐ │
│ │ Ram Sharma      │ │
│ └─────────────────┘ │
│                     │
│ Phone Number *      │
│ ┌─────────────────┐ │
│ │ 9801234567      │ │
│ └─────────────────┘ │
│                     │
│ Street Address *    │
│ ┌─────────────────┐ │
│ │ Koteshwor-15    │ │
│ └─────────────────┘ │
│                     │
│ Landmark            │
│ ┌─────────────────┐ │
│ │ Near hospital   │ │
│ └─────────────────┘ │
│                     │
│ City *              │
│ ┌─────────────────┐ │
│ │ Kathmandu    ▼  │ │
│ └─────────────────┘ │
│                     │
│ State *             │
│ ┌─────────────────┐ │
│ │ Bagmati      ▼  │ │
│ └─────────────────┘ │
│                     │
│ Postal Code         │
│ ┌─────────────────┐ │
│ │ 44600           │ │
│ └─────────────────┘ │
│                     │
│ ☐ Set as default    │
│                     │
├─────────────────────┤
│                     │
│   [Save Address]    │ ← Fixed bottom button
│                     │
└─────────────────────┘

✨ ANIMATIONS
Page Load

text

Timeline:

0.0s - Page loads
0.2s - Header fades in
0.3s - Section title slides in
0.4s - First address card fades up
0.5s - Second card fades up
...stagger continues
0.7s - Add new card fades up

Card Interactions

text

Hover (desktop):
- Card lifts up (translateY -4px)
- Shadow increases
- Duration: 0.3s

Click on Add New card:
- Card scales slightly
- Modal slides up (or page transition on mobile)

Modal Animations

text

Open:
- Overlay: Fade in (0.2s)
- Modal: Slide up + Fade in (0.3s)
- Start from translateY(20px) to translateY(0)

Close:
- Reverse of open
- Or slide down + fade out

Form Interactions

text

Input focus:
- Border color transition (0.2s)
- Shadow appears (0.2s)

Validation error:
- Input: Shake animation (quick, 2-3 times)
- Error message: Slide down + fade in

Submit:
- Button: Show loading spinner
- Success: Checkmark animation

Delete Confirmation

text

Open:
- Overlay fade in
- Modal scale from 0.95 to 1 + fade

Confirm delete:
- Card: Fade out + scale down
- Grid: Reflow animation
- Toast: Slide in from top/bottom

Set as Default

text

Click:
- Current default card: Border color fades to grey
- New default card: Border color animates to gold
- Badge: Slides in / previous badge slides out
- Toast notification: Slides in

Toast Notifications

text

Enter:
- Slide in from top-right (or bottom)
- Fade in

Auto-dismiss:
- Progress bar shrinks over 3 seconds
- Slide out + fade out

Manual dismiss:
- Fade out immediately

🔍 SEO & META
Meta Tags

HTML

<title>My Addresses | Kal Kal Group</title>

<meta name="description" content="Manage your shipping and billing addresses for Kal Kal Group. Add, edit, or delete addresses for faster checkout.">

<meta name="robots" content="noindex, nofollow"> <!-- Account pages should not be indexed -->

🔒 SECURITY CONSIDERATIONS
Authentication

text

- Addresses page requires login
- Redirect to login if not authenticated
- Session validation on each action
- Only show user's own addresses

Data Validation

text

- Sanitize all input fields
- Validate phone number format
- Prevent XSS in address fields
- Rate limit add/edit operations

Actions

text

- Confirm before delete
- Log address changes
- Validate ownership before edit/delete
- CSRF protection on forms

♿ ACCESSIBILITY
Address Cards

HTML

<article class="address-card" role="article" aria-labelledby="addr-1-name">
  <span class="default-badge" role="status">Default</span>
  
  <h3 id="addr-1-name">Ram Sharma</h3>
  <p>+977-9801234567</p>
  <address>
    Koteshwor-15, Near City Hospital<br>
    Kathmandu, Bagmati<br>
    Nepal - 44600
  </address>
  
  <div class="actions" role="group" aria-label="Address actions">
    <button aria-label="Edit address for Ram Sharma">Edit</button>
    <button aria-label="Delete address for Ram Sharma">Delete</button>
    <button aria-label="Set as default address">Set Default</button>
  </div>
</article>

Form

HTML

<form aria-labelledby="form-title">
  <h2 id="form-title">Add New Shipping Address</h2>
  
  <label for="fullName">
    Full Name 
    <span aria-hidden="true">*</span>
    <span class="sr-only">(required)</span>
  </label>
  <input 
    type="text" 
    id="fullName" 
    name="fullName"
    required
    aria-required="true"
    aria-describedby="fullName-error"
  >
  <span id="fullName-error" role="alert" aria-live="polite"></span>
</form>

Keyboard Navigation

text

Tab: Move through cards, buttons, form fields
Enter/Space: Activate buttons, submit form
Escape: Close modal
Arrow keys: Navigate dropdown options

Screen Reader

text

- Announce default address status
- Announce success/error messages
- Form labels properly associated
- Modal focus trapped

📋 ADDRESSES PAGE CHECKLIST
UI Checklist

    Clean header with title
    Shipping addresses section
    Billing addresses section
    Address cards (all states)
    Default badge styling
    Add new address card (dashed border)
    More menu (•••)
    Add/Edit modal
    Delete confirmation
    Form with all fields
    Form validation states
    Success/error toasts
    Empty states
    Loading states
    Help/tips section
    Mobile responsive

UX Checklist

    Add address flow smooth
    Edit pre-fills data
    Delete has confirmation
    Set default is quick
    Form validation real-time
    Error messages clear
    Success feedback
    Modal close options (X, outside click, ESC)
    Mobile touch-friendly
    Dropdown selections work

Functionality Checklist

    Add address works
    Edit address works
    Delete address works
    Set default works
    Form validation works
    Phone format validation
    City/State dropdowns populated
    Multiple addresses supported
    Both shipping and billing work

Accessibility Checklist

    Proper heading structure
    Form labels associated
    Error announcements
    Focus visible
    Keyboard navigable
    Modal focus trap
    Screen reader tested

📊 COMPLETE ADDRESSES PAGE WIREFRAME
Desktop

text

┌─────────────────────────────────────┐
│         NAVIGATION                  │
├─────────────────────────────────────┤
│                                     │
│          My Addresses               │  ← HEADER
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📦 Shipping Addresses    [+ Add]   │  ← Section title
│                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐
│  │★ DEFAULT │ │ Office   │ │   +     │
│  │          │ │          │ │  Add    │
│  │ Ram...   │ │ Sita...  │ │  New    │
│  │ Kathman..│ │ Bhakta...│ │         │
│  │          │ │          │ │         │
│  │[Edit][···]│ │[Edit][···]│ │         │
│  └──────────┘ └──────────┘ └──────────┘
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💳 Billing Addresses     [+ Add]   │  ← Section title
│                                     │
│  ┌──────────┐ ┌──────────┐          │
│  │★ DEFAULT │ │   +      │          │
│  │          │ │  Add     │          │
│  │ Ram...   │ │  New     │          │
│  │ Kathman..│ │          │          │
│  │          │ │          │          │
│  │[Edit][···]│ │          │          │
│  └──────────┘ └──────────┘          │
│                                     │
│  ☐ Use shipping as billing          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💡 Address Tips                    │  ← Help section
│  [Tip 1] [Tip 2] [Tip 3]            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│            FOOTER                   │
│                                     │
└─────────────────────────────────────┘

🎯 QUICK WINS FOR UI/UX IMPROVEMENT
Priority 1 (High Impact)

    Clear default badge - Gold border + badge for default address
    Add new card design - Dashed border, clear CTA
    Better form layout - Two-column for city/state, proper validation

Priority 2 (Important)

    More menu (•••) - Quick actions dropdown
    Delete confirmation - Prevent accidental deletion
    Success toasts - Feedback for actions

Priority 3 (Nice to Have)

    Address labels - Home, Office, etc.
    Copy address - Quick copy to clipboard
    Swipe actions mobile - Swipe to edit/delete

🏠 ADDRESS LABELS / TYPES

Suggested Labels:

text

┌─────────────┐
│ 🏠 Home     │
├─────────────┤
│ 🏢 Office   │
├─────────────┤
│ 👨‍👩‍👧 Parents │
├─────────────┤
│ 🏠 Other    │
└─────────────┘

Custom Label:

text

Allow users to type custom label (max 20 chars)
Examples: "Apartment", "Warehouse", "Shop"

📝 FORM FIELD SPECIFICATIONS
Full Name

text

Type: text
Min length: 2
Max length: 100
Pattern: Letters, spaces, dots (for titles like Mr., Dr.)
Error: "Please enter a valid name"

Phone Number

text

Type: tel
Format: 10 digits (Nepal mobile) or landline
Prefix: +977 (auto-added or dropdown)
Pattern: ^[0-9]{10}$ or ^[0-9]{7,8}$ (landline)
Error: "Please enter a valid phone number"

Street Address

text

Type: text
Min length: 5
Max length: 200
Placeholder: "Ward number, Tole name, Street"
Error: "Please enter your street address"

Landmark

text

Type: text (optional)
Max length: 100
Placeholder: "Near, Opposite to, Behind..."
Helpful for delivery

City

text

Type: dropdown with search OR text input
Options: Major Nepal cities + "Other"
If Other: Show text input
Error: "Please select or enter your city"

State/Province

text

Type: dropdown
Options: 7 provinces of Nepal
Required
Error: "Please select your state/province"

Country

text

Type: dropdown
Default: Nepal (pre-selected)
Options: Nepal (primary), maybe India, others
Most users won't change this

Postal Code

text

Type: text
Pattern: 5 digits
Optional (not all areas have postal codes in Nepal)
Placeholder: "e.g., 44600"

🔄 ADDRESS ACTIONS FLOW
Add Address

text

1. Click "+ Add New" or Add card
2. Modal opens (or page transition on mobile)
3. Fill form
4. Validate in real-time
5. Click "Save Address"
6. Show loading
7. Success: Close modal, add card to grid, show toast
8. Error: Show error message, keep modal open

Edit Address

text

1. Click "Edit" or select from more menu
2. Modal opens with pre-filled data
3. Make changes
4. Click "Save Changes"
5. Show loading
6. Success: Close modal, update card, show toast
7. Error: Show error message

Delete Address

text

1. Click "Delete" or select from more menu
2. Confirmation modal appears
3. Shows address preview
4. Click "Delete Address"
5. Show loading
6. Success: Remove card with animation, show toast
7. If was default: Prompt to set new default (or auto-set oldest)

Set as Default

text

1. Click "Set as Default" or select from more menu
2. Show loading on button
3. API call
4. Success: 
   - Remove default badge from old card
   - Add default badge to new card
   - Update border colors
   - Show success toast
5. No confirmation needed (reversible action)