Complete MVP for Account Page Redesign
Structure + UI + UX
🎯 ACCOUNT PAGE PURPOSE

Goals:

    Provide a central hub for all account-related activities
    Display user profile and account status at a glance
    Enable quick access to common actions
    Allow profile information updates
    Show account statistics and membership details
    Build trust and engagement through personalization

User Intent:

    "I want to see my account overview"
    "I need to update my profile"
    "I want to change my password"
    "Where can I find my orders?"
    "I want to manage my addresses"
    "What's my membership status?"

Users:

    Registered customers
    Returning buyers
    Account managers (Admin)

🎨 UI DESIGN SYSTEM (Account Page Specific)
Color Usage
Element	Color
Page background	Off-white #FAF9F6
Cards/Sections	White #FFFFFF
Primary accent	Gold #D4A017
Active badge	Green #43A047
Verified badge	Blue #2196F3
Gold tier	Gold #D4A017
Silver tier	Silver #9E9E9E
Bronze tier	Bronze #CD7F32
Avatar background	Deep Green #1B4332
Avatar text	White #FFFFFF
Stats numbers	Deep Green #1B4332
Action cards	White with hover gold
Input focus	Gold #D4A017
Success state	Green #43A047
Section dividers	Light grey #EEEEEE
Account Page Typography
Element	Font	Size Desktop	Size Mobile
Page title	Poppins Bold	32px	26px
Welcome message	Poppins SemiBold	24px	20px
User name (hero)	Poppins Bold	28px	22px
Section titles	Poppins SemiBold	20px	18px
Card titles	Poppins Medium	16px	15px
Card descriptions	Inter Regular	14px	13px
Stats numbers	Poppins Bold	28px	24px
Stats labels	Inter Regular	13px	12px
Badge text	Poppins SemiBold	11px	10px
Form labels	Inter Medium	14px	14px
Form inputs	Inter Regular	16px	16px
Button text	Poppins Medium	14px	14px
Helper text	Inter Regular	13px	12px
📐 PAGE STRUCTURE
Overall Layout

text

┌─────────────────────────────────────┐
│         NAVIGATION BAR              │
├─────────────────────────────────────┤
│                                     │
│         ACCOUNT HERO                │
│    (Welcome + Profile Summary)      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    SIDEBAR      │    MAIN CONTENT   │
│    (Navigation) │    (Sections)     │
│                 │                   │
│                 │                   │
│                 │                   │
│                 │                   │
│                 │                   │
├─────────────────────────────────────┤
│         FOOTER                      │
└─────────────────────────────────────┘

👤 SECTION-BY-SECTION BREAKDOWN
SECTION 1: ACCOUNT HERO / HEADER

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Home > My Account                          (Breadcrumb)    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│     ┌────────────┐                                          │
│     │            │                                          │
│     │     A      │   Welcome back, Admin!                   │
│     │            │                                          │
│     │  (Avatar)  │   admin@kalkal.com                       │
│     │            │   [🟢 ACTIVE]  [✓ Verified]  [🏆 Gold]   │
│     └────────────┘                                          │
│                                                             │
│     Member since Dec 28, 2025                               │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │     12       │  │      3       │  │      5       │       │
│  │   Orders     │  │   Active     │  │  Addresses   │       │
│  │   Placed     │  │   Orders     │  │   Saved      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Alternative - More Visual Hero:

text

┌─────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░                                                    ░░░░│
│░░░░  ┌────────┐                                        ░░░░│
│░░░░  │   A    │  Admin User                [Edit Profile]░░│
│░░░░  │        │  admin@kalkal.com                      ░░░░│
│░░░░  └────────┘  🟢 Active  ✓ Verified  🏆 Gold Member ░░░░│
│░░░░                                                    ░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────────────────────────────┘
  (Background: Gradient or pattern with brand colors)

UI Specs:

Hero Container:

text

Background: 
  Option A: White with subtle gradient
  Option B: Deep Green gradient with pattern
  Option C: Light grey with avatar highlight

Height: 280-320px desktop, 240-280px mobile
Padding: 40px
Border-radius: 0 (full width) or 20px (card style)
Margin-bottom: 32px

Avatar:

text

Size: 100px x 100px (desktop), 80px x 80px (mobile)
Background: Deep Green #1B4332
Border-radius: 50% (circle)
Border: 4px solid White
Shadow: 0 10px 30px rgba(0,0,0,0.15)

If image:
- Object-fit: Cover
- Show user photo

If no image (initials):
- Display first letter of name
- Font: 40px Poppins Bold
- Color: White
- Text-align: Center

Upload option:
- Camera icon overlay on hover
- Click to upload new photo

Avatar with Upload:

text

┌─────────────────┐
│                 │
│       A         │
│                 │
│    ┌───────┐    │
│    │ 📷    │    │  ← Appears on hover
│    │Change │    │
│    └───────┘    │
└─────────────────┘

User Info:

text

Name:
- Font: 28px Poppins Bold
- Color: #333333 (or White on dark bg)
- Margin-left: 24px from avatar

Email:
- Font: 16px Inter Regular
- Color: #666666 (or White 80% on dark bg)
- Margin-top: 4px

Badges row:
- Display: Flex
- Gap: 12px
- Margin-top: 12px

Status Badges:
Badge	Background	Text	Icon
Active	Green #E8F5E9	Green #2E7D32	🟢
Inactive	Grey #F5F5F5	Grey #757575	⚪
Verified	Blue #E3F2FD	Blue #1565C0	✓
Unverified	Orange #FFF3E0	Orange #E65100	⚠
Gold	Gold #FFF8E1	Gold #F9A825	🏆
Silver	Grey #F5F5F5	Grey #616161	🥈
Bronze	Bronze #EFEBE9	Bronze #6D4C41	🥉

Badge UI:

text

┌────────────────┐
│  🟢 ACTIVE     │
└────────────────┘

Padding: 6px 14px
Border-radius: 20px (pill)
Font: 11px Poppins SemiBold
Text-transform: Uppercase
Letter-spacing: 0.5px

Member Since:

text

Font: 14px Inter Regular
Color: #999999
Margin-top: 16px

Format: "Member since Dec 28, 2025"

Stats Bar:

text

Container:
- Display: Flex
- Gap: 24px
- Margin-top: 32px
- Background: White (or semi-transparent on dark bg)
- Padding: 24px
- Border-radius: 12px
- Shadow: 0 4px 20px rgba(0,0,0,0.06)

Stat item:
┌──────────────┐
│     12       │  ← 28px Poppins Bold, Deep Green
│   Orders     │  ← 13px Inter Regular, Grey
│   Placed     │
└──────────────┘

- Text-align: Center
- Min-width: 100px
- Click to navigate to respective page
- Hover: Background light grey, cursor pointer

Divider between stats (optional):
- Width: 1px
- Height: 40px
- Background: #EEEEEE

SECTION 2: MAIN LAYOUT (Sidebar + Content)

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │                  │  │                                │  │
│  │   SIDEBAR        │  │   MAIN CONTENT                 │  │
│  │   (Navigation)   │  │                                │  │
│  │                  │  │                                │  │
│  │   👤 Profile     │  │   Quick Actions                │  │
│  │   📍 Addresses   │  │   ─────────────                │  │
│  │   📦 Orders      │  │   [Action Cards]               │  │
│  │   🔒 Security    │  │                                │  │
│  │   ⚙️ Settings    │  │   Profile Information          │  │
│  │                  │  │   ─────────────────            │  │
│  │   ─────────────  │  │   [Form Fields]                │  │
│  │                  │  │                                │  │
│  │   🚪 Logout      │  │   Account Information          │  │
│  │                  │  │   ─────────────────            │  │
│  │                  │  │   [Read-only info]             │  │
│  │                  │  │                                │  │
│  │                  │  │                                │  │
│  └──────────────────┘  └────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

SECTION 3: SIDEBAR NAVIGATION

Structure:

text

┌──────────────────────┐
│                      │
│   Account Menu       │
│                      │
│   ─────────────────  │
│                      │
│   ● Profile          │ ← Active (highlighted)
│     Personal info    │
│                      │
│   ○ Address Book     │
│     Shipping & Billing│
│                      │
│   ○ Orders           │
│     History & Tracking│
│                      │
│   ○ Security         │
│     Password & 2FA   │
│                      │
│   ○ Settings         │
│     Preferences      │
│                      │
│   ─────────────────  │
│                      │
│   ○ Help & Support   │
│                      │
│   ○ Logout           │
│                      │
└──────────────────────┘

Menu Items:
Item	Icon	Description	Link
Profile	👤	Personal info	/account
Address Book	📍	Shipping & Billing	/addresses
Orders	📦	History & Tracking	/orders
Security	🔒	Password & 2FA	/account/security
Settings	⚙️	Preferences	/account/settings
Help & Support	❓	Contact & FAQ	/contact
Logout	🚪	Sign out	/auth/logout

UI Specs:

text

Sidebar container:
- Width: 280px (fixed)
- Background: White
- Border-radius: 16px
- Shadow: 0 4px 20px rgba(0,0,0,0.06)
- Padding: 24px
- Position: Sticky (top: nav height + 24px)
- Max-height: Calc(100vh - offset)

Section title:
- Font: 14px Poppins SemiBold
- Color: #999999
- Text-transform: Uppercase
- Letter-spacing: 1px
- Margin-bottom: 16px

Menu item:
┌────────────────────────────┐
│  👤  Profile               │
│      Personal info         │
└────────────────────────────┘

Active:
- Background: Light gold #FDF6E3
- Border-left: 3px solid Gold #D4A017
- Color: Deep Green #1B4332
- Font-weight: SemiBold

Inactive:
- Background: Transparent
- Color: #666666
- Font-weight: Regular

Hover:
- Background: #F5F5F5

Item structure:
- Padding: 14px 16px
- Border-radius: 8px (right side only if using border-left)
- Margin-bottom: 4px
- Cursor: Pointer
- Transition: All 0.2s ease

Icon:
- Size: 20px
- Margin-right: 14px
- Color: Same as text (or always gold for active)

Primary text:
- Font: 15px Poppins Medium
- Display: Block

Secondary text:
- Font: 12px Inter Regular
- Color: #999999
- Margin-top: 2px

Divider:
- Height: 1px
- Background: #EEEEEE
- Margin: 16px 0

Logout item:
- Color: Red #E53935 (on hover)
- Or: Normal style, red only on hover

SECTION 4: QUICK ACTIONS

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Quick Actions                                             │
│   Get things done faster                                    │
│                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   │                 │  │                 │  │                 │
│   │   🔒            │  │   📍            │  │   📦            │
│   │                 │  │                 │  │                 │
│   │ Update Password │  │ Add New Address │  │ Track Order     │
│   │ Keep your       │  │ Speed through   │  │ Check current   │
│   │ account secure  │  │ checkout        │  │ status          │
│   │                 │  │                 │  │                 │
│   │            [→]  │  │            [→]  │  │            [→]  │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘

Action Cards:
Action	Icon	Title	Description
Update Password	🔒	Update Password	Keep your account secure
Add Address	📍	Add New Address	Speed through checkout
Track Order	📦	Track Latest Order	Check current status
Edit Profile	✏️	Edit Profile	Update your information
View Orders	🛒	Order History	View all past orders
Get Help	❓	Need Help?	Contact our support

UI Specs:

text

Section container:
- Background: White
- Border-radius: 16px
- Padding: 32px
- Shadow: 0 4px 20px rgba(0,0,0,0.06)
- Margin-bottom: 24px

Section title:
- Font: 20px Poppins SemiBold
- Color: #333333
- Margin-bottom: 4px

Section description:
- Font: 14px Inter Regular
- Color: #666666
- Margin-bottom: 24px

Cards grid:
- Display: Grid
- Columns: 3 (desktop), 2 (tablet), 1 (mobile)
- Gap: 20px

Action Card UI:

text

┌─────────────────────────┐
│                         │
│   ┌─────────┐           │
│   │   🔒    │           │  ← Icon in circle
│   └─────────┘           │
│                         │
│   Update Password       │  ← Title
│                         │
│   Keep your account     │  ← Description
│   secure                │
│                         │
│                    [→]  │  ← Arrow (appears on hover)
│                         │
└─────────────────────────┘

Card:
- Background: White
- Border: 1.5px solid #EEEEEE
- Border-radius: 12px
- Padding: 24px
- Cursor: Pointer
- Transition: All 0.3s ease

Hover:
- Border-color: Gold #D4A017
- Shadow: 0 8px 25px rgba(0,0,0,0.08)
- Transform: translateY(-4px)
- Arrow: Moves right 4px + color gold

Icon container:
- Width: 56px
- Height: 56px
- Background: Light gold #FDF6E3
- Border-radius: 12px
- Display: Flex
- Align-items: Center
- Justify-content: Center
- Margin-bottom: 16px

Icon:
- Size: 28px
- Color: Gold #D4A017

Title:
- Font: 16px Poppins Medium
- Color: #333333
- Margin-bottom: 8px

Description:
- Font: 14px Inter Regular
- Color: #666666
- Line-height: 1.5

Arrow:
- Position: Bottom right
- Size: 20px
- Color: #CCCCCC → Gold on hover
- Transition: Transform 0.2s ease

SECTION 5: PROFILE INFORMATION (Editable Form)

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Profile Information                              [Edit]   │
│   Update your personal information                          │
│                                                             │
│   ─────────────────────────────────────────────────────────  │
│                                                             │
│   ┌─────────────────────────┐  ┌─────────────────────────┐  │
│   │ First Name              │  │ Last Name               │  │
│   │ ┌─────────────────────┐ │  │ ┌─────────────────────┐ │  │
│   │ │ Admin               │ │  │ │ User                │ │  │
│   │ └─────────────────────┘ │  │ └─────────────────────┘ │  │
│   └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Email Address                                       │   │
│   │ ┌─────────────────────────────────────────────────┐ │   │
│   │ │ admin@kalkal.com                          [✓]   │ │   │
│   │ └─────────────────────────────────────────────────┘ │   │
│   │   ✓ Email verified                                  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Phone Number                                        │   │
│   │ ┌─────────────────────────────────────────────────┐ │   │
│   │ │ +977 9801234567                                 │ │   │
│   │ └─────────────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ─────────────────────────────────────────────────────────  │
│                                                             │
│                          [Cancel]     [Save Changes]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

View Mode vs Edit Mode:

View Mode (Default):

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Profile Information                              [Edit]   │
│                                                             │
│   Full Name                                                 │
│   Admin User                                                │
│                                                             │
│   Email Address                    ✓ Verified               │
│   admin@kalkal.com                                          │
│                                                             │
│   Phone Number                                              │
│   +977 9801234567                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

- Read-only display
- Edit button in header
- Click Edit to switch to form

Edit Mode:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Profile Information                            [Cancel]   │
│                                                             │
│   First Name *                     Last Name *              │
│   ┌─────────────────────┐         ┌─────────────────────┐  │
│   │ Admin               │         │ User                │  │
│   └─────────────────────┘         └─────────────────────┘  │
│                                                             │
│   Email Address *                                           │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ admin@kalkal.com                                    │  │
│   └─────────────────────────────────────────────────────┘  │
│   ⚠ Changing email will require re-verification            │
│                                                             │
│   Phone Number                                              │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ +977 9801234567                                     │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│                          [Cancel]     [Save Changes]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

- Editable inputs
- Cancel to discard changes
- Save to submit

Form Fields:
Field	Type	Required	Validation
First Name	Text	Yes	Min 2 chars
Last Name	Text	Yes	Min 2 chars
Email	Email	Yes	Valid email format
Phone	Tel	No	Valid Nepal format
Date of Birth	Date	No	Past date only
Gender	Select	No	Male/Female/Other/Prefer not to say

UI Specs:

text

Section container:
- Background: White
- Border-radius: 16px
- Padding: 32px
- Shadow: 0 4px 20px rgba(0,0,0,0.06)
- Margin-bottom: 24px

Section header:
- Display: Flex
- Justify-content: Space-between
- Align-items: Center
- Margin-bottom: 24px

Section title:
- Font: 20px Poppins SemiBold
- Color: #333333

Section description:
- Font: 14px Inter Regular
- Color: #666666
- Margin-top: 4px

Edit button:
- Background: Transparent
- Border: 1.5px solid #E0E0E0
- Color: #666666
- Padding: 10px 20px
- Border-radius: 8px
- Icon: ✏️ Pencil
- Hover: Border gold, color gold

Form grid:
- Display: Grid
- Columns: 2 (for name fields)
- Gap: 20px
- Margin-bottom: 24px

Form labels:
- Font: 14px Inter Medium
- Color: #333333
- Margin-bottom: 8px

Form inputs:
- Height: 52px
- Background: #FAFAFA
- Border: 1.5px solid #E0E0E0
- Border-radius: 10px
- Padding: 16px
- Font: 16px Inter Regular

Input focus:
- Border: 2px solid Gold #D4A017
- Background: White
- Shadow: 0 0 0 4px rgba(212,160,23,0.1)

Verified badge (email):
- Display inline after email
- Icon: ✓
- Color: Green #43A047
- Font: 13px

Warning text:
- Font: 13px Inter Regular
- Color: Orange #FF9800
- Icon: ⚠
- Margin-top: 8px

Button container:
- Display: Flex
- Gap: 16px
- Justify-content: Flex-end
- Margin-top: 24px
- Padding-top: 24px
- Border-top: 1px solid #EEEEEE

Cancel button:
- Background: Transparent
- Border: 1.5px solid #E0E0E0
- Color: #666666
- Padding: 14px 28px
- Border-radius: 10px

Save button:
- Background: Gold #D4A017
- Color: White
- Padding: 14px 28px
- Border-radius: 10px
- Shadow: 0 4px 15px rgba(212,160,23,0.3)

View Mode Field Display:

text

┌────────────────────────────────────────┐
│                                        │
│  Full Name                             │  ← Label (14px, grey)
│  Admin User                            │  ← Value (16px, dark)
│                                        │
└────────────────────────────────────────┘

Label:
- Font: 14px Inter Regular
- Color: #999999
- Margin-bottom: 4px

Value:
- Font: 16px Inter Medium
- Color: #333333

Container:
- Padding: 16px 0
- Border-bottom: 1px solid #F5F5F5 (optional)

SECTION 6: ACCOUNT INFORMATION (Read-Only)

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Account Information                                       │
│   Your account details and statistics                       │
│                                                             │
│   ─────────────────────────────────────────────────────────  │
│                                                             │
│   ┌─────────────────────────┐  ┌─────────────────────────┐  │
│   │                         │  │                         │  │
│   │  Account Created        │  │  User ID                │  │
│   │  December 28, 2025      │  │  72955653-e54d-...      │  │
│   │                         │  │                  [Copy] │  │
│   └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────┐  ┌─────────────────────────┐  │
│   │                         │  │                         │  │
│   │  Customer Tier          │  │  Last Login             │  │
│   │  🏆 Gold Member         │  │  Today, 10:30 AM        │  │
│   │                         │  │                         │  │
│   └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────┐  ┌─────────────────────────┐  │
│   │                         │  │                         │  │
│   │  Total Orders           │  │  Total Spent            │  │
│   │  12 orders              │  │  Rs 15,680              │  │
│   │                         │  │                         │  │
│   └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Info Items:
Item	Value	Icon/Action
Account Created	December 28, 2025	📅
User ID	72955653-e54d-...	[Copy]
Customer Tier	Gold Member	🏆
Last Login	Today, 10:30 AM	🕐
Total Orders	12 orders	📦
Total Spent	Rs 15,680	💰
Account Status	Active	🟢
Email Status	Verified	✓

UI Specs:

text

Info card grid:
- Display: Grid
- Columns: 2
- Gap: 20px

Info card:
┌─────────────────────────────┐
│                             │
│  Account Created            │  ← Label
│  December 28, 2025          │  ← Value
│                             │
└─────────────────────────────┘

- Background: #F9F9F9 (or #FAFAFA)
- Border-radius: 12px
- Padding: 20px
- Border: 1px solid #EEEEEE (optional)

Label:
- Font: 13px Inter Regular
- Color: #999999
- Margin-bottom: 8px

Value:
- Font: 16px Poppins Medium
- Color: #333333

Copy button (for User ID):
- Small icon button
- Tooltip: "Copy to clipboard"
- Success: Show "Copied!" briefly

User ID with Copy:

text

┌─────────────────────────────────────────┐
│                                         │
│  User ID                                │
│  72955653-e54d-432a-ad31-...    [📋]   │
│                                   ↑     │
│                              Copy icon  │
└─────────────────────────────────────────┘

- Show truncated ID
- Click to copy full ID
- Toast: "User ID copied to clipboard"

SECTION 7: SECURITY SETTINGS (Optional Section or Separate Page)

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Security                                                  │
│   Manage your password and security settings                │
│                                                             │
│   ─────────────────────────────────────────────────────────  │
│                                                             │
│   Password                                                  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │   🔒 ●●●●●●●●●●●●                                   │   │
│   │                                                     │   │
│   │   Last changed: 30 days ago                         │   │
│   │                                                     │   │
│   │   [Change Password]                                 │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Two-Factor Authentication                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │   🔐 Not enabled                                    │   │
│   │                                                     │   │
│   │   Add an extra layer of security                    │   │
│   │                                                     │   │
│   │   [Enable 2FA]                                      │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Active Sessions                                           │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │   💻 Windows • Chrome • Kathmandu                   │   │
│   │      Current session                                │   │
│   │                                                     │   │
│   │   📱 Android • App • Bhaktapur                      │   │
│   │      Last active: 2 hours ago          [Revoke]     │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

SECTION 8: CHANGE PASSWORD MODAL

Structure:

text

┌─────────────────────────────────────────────────────────────┐
│                                                        [✕]  │
│                                                             │
│                   Change Password                           │
│                                                             │
│   ─────────────────────────────────────────────────────────  │
│                                                             │
│   Current Password *                                        │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ ●●●●●●●●                                        👁  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   New Password *                                            │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ ●●●●●●●●●●●●                                    👁  │   │
│   └─────────────────────────────────────────────────────┘   │
│   Password strength: Strong ████████░░                      │
│                                                             │
│   Confirm New Password *                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ ●●●●●●●●●●●●                                    👁  │   │
│   └─────────────────────────────────────────────────────┘   │
│   ✓ Passwords match                                         │
│                                                             │
│   ─────────────────────────────────────────────────────────  │
│                                                             │
│   Password requirements:                                    │
│   ✓ At least 8 characters                                  │
│   ✓ One uppercase letter                                   │
│   ✓ One lowercase letter                                   │
│   ✓ One number                                             │
│   ○ One special character (optional)                       │
│                                                             │
│   ─────────────────────────────────────────────────────────  │
│                                                             │
│               [Cancel]           [Update Password]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Password Strength Indicator:

text

Weak:     ██░░░░░░░░  (Red)
Fair:     ████░░░░░░  (Orange)
Good:     ██████░░░░  (Yellow)
Strong:   ████████░░  (Light Green)
Excellent:██████████  (Green)

Requirements Checklist:

text

✓ At least 8 characters      (Green check when met)
○ One uppercase letter        (Grey circle when not met)
✓ One lowercase letter
✓ One number
○ One special character

📱 MOBILE ACCOUNT PAGE
Mobile Layout

text

┌─────────────────────┐
│    NAVIGATION       │
├─────────────────────┤
│                     │
│  ┌────────────────┐ │
│  │                │ │
│  │      [A]       │ │ ← Avatar
│  │                │ │
│  │   Admin User   │ │
│  │  admin@kal...  │ │
│  │                │ │
│  │ [🟢] [✓] [🏆]  │ │ ← Badges
│  │                │ │
│  │ ┌────┐ ┌────┐  │ │
│  │ │ 12 │ │  3 │  │ │ ← Stats
│  │ │Ordr│ │Addr│  │ │
│  │ └────┘ └────┘  │ │
│  └────────────────┘ │
│                     │
├─────────────────────┤
│                     │
│  Quick Actions      │
│  ┌───────┐┌───────┐ │
│  │ 🔒    ││ 📍    │ │
│  │Passwd ││Address│ │
│  └───────┘└───────┘ │
│  ┌───────┐┌───────┐ │
│  │ 📦    ││ ✏️    │ │
│  │ Track ││ Edit  │ │
│  └───────┘└───────┘ │
│                     │
├─────────────────────┤
│                     │
│  Account Menu       │
│  ───────────────    │
│  👤 Profile      → │
│  📍 Addresses    → │
│  📦 Orders       → │
│  🔒 Security     → │
│  ⚙️ Settings     → │
│  ───────────────    │
│  ❓ Help         → │
│  🚪 Logout       → │
│                     │
├─────────────────────┤
│     FOOTER          │
└─────────────────────┘

Mobile Navigation Style

text

┌─────────────────────────────┐
│                             │
│  👤 Profile              →  │
│     Personal information    │
│                             │
├─────────────────────────────┤
│                             │
│  📍 Addresses            →  │
│     Shipping & Billing      │
│                             │
├─────────────────────────────┤
│                             │
│  📦 Orders               →  │
│     History & Tracking      │
│                             │
└─────────────────────────────┘

- Full width list items
- Chevron arrow on right
- Click to navigate to page
- Subtle dividers between items

Mobile Profile Edit

text

┌─────────────────────┐
│ ← Edit Profile      │
├─────────────────────┤
│                     │
│   ┌──────────────┐  │
│   │      [A]     │  │ ← Change photo
│   │   [📷 Edit]  │  │
│   └──────────────┘  │
│                     │
│ First Name          │
│ ┌─────────────────┐ │
│ │ Admin           │ │
│ └─────────────────┘ │
│                     │
│ Last Name           │
│ ┌─────────────────┐ │
│ │ User            │ │
│ └─────────────────┘ │
│                     │
│ Email               │
│ ┌─────────────────┐ │
│ │ admin@kalkal... │ │
│ └─────────────────┘ │
│                     │
│ Phone               │
│ ┌─────────────────┐ │
│ │ 9801234567      │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│                     │
│  [Save Changes]     │ ← Fixed bottom
│                     │
└─────────────────────┘

✨ ANIMATIONS
Page Load

text

Timeline:

0.0s - Page loads
0.2s - Hero section fades in
0.3s - Avatar bounces in (scale 0 → 1)
0.4s - User info slides in from right
0.5s - Badges fade in (staggered)
0.6s - Stats animate (count up)
0.7s - Sidebar slides in from left
0.8s - Main content sections fade up (staggered)

Avatar Upload

text

Hover on avatar:
- Overlay fades in with camera icon
- Slight scale up (1.05)

Click:
- File picker opens
- On select: Show loading spinner on avatar
- On success: New image fades in, old fades out
- Toast: "Profile photo updated"

Edit Mode Toggle

text

Click "Edit" button:
- Button morphs to "Cancel"
- View mode fades out
- Edit mode fades in
- First input auto-focuses

Click "Cancel":
- Reverse animation
- Discard changes confirmation (if changes made)

Form Interactions

text

Input focus:
- Border color transition (0.2s)
- Label color changes
- Shadow appears

Save button:
- Click: Scale down → Loading spinner → Checkmark
- Success: Form fades, view mode returns
- Toast notification slides in

Sidebar Navigation

text

Hover on menu item:
- Background color slides in from left
- Duration: 0.2s

Active state:
- Border-left animates in
- Background fades to light gold

Quick Action Cards

text

Hover:
- Card lifts up (translateY -4px)
- Border color changes to gold
- Shadow increases
- Arrow moves right

Click:
- Card scales down slightly
- Navigate to destination

Stats Counter

text

Page load:
- Numbers count up from 0 to actual value
- Duration: 1.5 seconds
- Easing: Ease-out

Example:
0 → 3 → 7 → 10 → 11 → 12

🔍 SEO & META
Meta Tags

HTML

<title>My Account | Kal Kal Group</title>

<meta name="description" content="Manage your Kal Kal Group account. Update profile, manage addresses, view orders, and account settings.">

<meta name="robots" content="noindex, nofollow"> <!-- Account pages should not be indexed -->

🔒 SECURITY CONSIDERATIONS
Authentication

text

- Account page requires login
- Session validation on all actions
- Sensitive actions require re-authentication
- Auto-logout on inactivity (optional)

Profile Updates

text

- Email change requires verification
- Password change requires current password
- Rate limit update requests
- Log all profile changes

Data Display

text

- Mask sensitive data (partial phone, etc.)
- Don't expose internal IDs unnecessarily
- HTTPS required
- XSS protection on display fields

♿ ACCESSIBILITY
Structure

HTML

<main role="main" aria-labelledby="page-title">
  <h1 id="page-title">My Account</h1>
  
  <section aria-labelledby="profile-section">
    <h2 id="profile-section">Profile Information</h2>
    <!-- Content -->
  </section>
  
  <nav aria-labelledby="account-nav">
    <h2 id="account-nav" class="sr-only">Account Navigation</h2>
    <ul role="menu">
      <li role="menuitem"><a href="/account">Profile</a></li>
      <li role="menuitem"><a href="/addresses">Addresses</a></li>
    </ul>
  </nav>
</main>

Form Accessibility

HTML

<form aria-labelledby="profile-form-title">
  <h2 id="profile-form-title">Edit Profile</h2>
  
  <label for="firstName">
    First Name
    <span aria-hidden="true">*</span>
    <span class="sr-only">(required)</span>
  </label>
  <input 
    type="text" 
    id="firstName" 
    name="firstName"
    required
    aria-required="true"
    aria-describedby="firstName-error"
  >
  <span id="firstName-error" role="alert" aria-live="polite"></span>
</form>

Keyboard Navigation

text

Tab: Move through sidebar items, form fields, buttons
Enter/Space: Activate buttons, links
Escape: Close modals, cancel edit mode
Arrow keys: Navigate within sidebar menu

📋 ACCOUNT PAGE CHECKLIST
UI Checklist

    Hero section with avatar
    User name and email display
    Status badges (Active, Verified, Tier)
    Stats summary
    Sidebar navigation
    Active state on current page
    Quick action cards
    Profile information section (view/edit)
    Account information section
    Form styling (all states)
    Button styling (all states)
    Loading states
    Success/error feedback
    Mobile responsive

UX Checklist

    View/edit mode toggle smooth
    Form validation real-time
    Save confirmation
    Cancel discards changes
    Avatar upload works
    Password change flow
    Quick actions navigate correctly
    Sidebar navigation works
    Mobile touch-friendly
    Logout confirmation

Functionality Checklist

    Profile update works
    Avatar upload works
    Email change with verification
    Password change works
    Logout works
    Navigation links correct
    Stats accurate
    Copy user ID works

Accessibility Checklist

    Proper heading structure
    Form labels associated
    Focus visible
    Keyboard navigable
    Screen reader tested
    Color contrast passing

📊 COMPLETE ACCOUNT PAGE WIREFRAME
Desktop

text

┌─────────────────────────────────────────────────────────────┐
│                       NAVIGATION                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │  [A]  Admin User                                        ││
│  │       admin@kalkal.com                                  ││
│  │       [🟢 Active] [✓ Verified] [🏆 Gold]                ││
│  │                                                         ││
│  │       ┌─────┐ ┌─────┐ ┌─────┐                          ││
│  │       │ 12  │ │  3  │ │  5  │                          ││
│  │       │Order│ │Activ│ │Addr │                          ││
│  │       └─────┘ └─────┘ └─────┘                          ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────┐  ┌──────────────────────────────────────┐  │
│  │            │  │                                      │  │
│  │  SIDEBAR   │  │  Quick Actions                       │  │
│  │            │  │  ┌──────┐ ┌──────┐ ┌──────┐          │  │
│  │  ● Profile │  │  │ 🔒   │ │ 📍   │ │ 📦   │          │  │
│  │  ○ Address │  │  │Passwd│ │ Addr │ │Track │          │  │
│  │  ○ Orders  │  │  └──────┘ └──────┘ └──────┘          │  │
│  │  ○ Security│  │                                      │  │
│  │  ○ Settings│  │  ─────────────────────────────────── │  │
│  │            │  │                                      │  │
│  │  ──────    │  │  Profile Information         [Edit]  │  │
│  │            │  │                                      │  │
│  │  ○ Help    │  │  First Name      Last Name           │  │
│  │  ○ Logout  │  │  Admin           User                │  │
│  │            │  │                                      │  │
│  │            │  │  Email           Phone               │  │
│  │            │  │  admin@kal...    9801234567          │  │
│  │            │  │                                      │  │
│  │            │  │  ─────────────────────────────────── │  │
│  │            │  │                                      │  │
│  │            │  │  Account Information                 │  │
│  │            │  │                                      │  │
│  │            │  │  Created    User ID                  │  │
│  │            │  │  Dec 2025   72955...   [Copy]        │  │
│  │            │  │                                      │  │
│  └────────────┘  └──────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        FOOTER                               │
└─────────────────────────────────────────────────────────────┘

🎯 QUICK WINS FOR UI/UX IMPROVEMENT
Priority 1 (High Impact)

    Better hero section - Avatar, badges, stats in organized layout
    Clear sidebar navigation - Active states, icons, descriptions
    View/Edit mode - Toggle between read-only and edit form

Priority 2 (Important)

    Quick action cards - Common tasks easily accessible
    Stats with count animation - Engaging, informative
    Mobile-first navigation - List-based menu for mobile

Priority 3 (Nice to Have)

    Avatar upload - Personalization
    Password strength meter - Security feedback
    Activity log - Recent account activity

🔄 ACCOUNT PAGE SECTIONS SUMMARY
Section	Purpose	Editable
Hero/Header	Overview, avatar, stats	Avatar only
Sidebar	Navigation	N/A
Quick Actions	Shortcuts to common tasks	N/A
Profile Information	Name, email, phone	Yes
Account Information	Created date, ID, tier	No
Security	Password, 2FA	Yes
Settings	Preferences, notifications	Yes
💡 ADDITIONAL FEATURES TO CONSIDER
1. Activity Log

text

Recent Activity:
- Password changed - 2 days ago
- Address added - 1 week ago
- Order placed - 3 days ago

2. Notification Preferences

text

☑ Order updates (Email)
☑ Order updates (SMS)
☐ Promotional offers
☑ Newsletter

3. Connected Accounts

text

Google: Connected ✓ [Disconnect]
Facebook: Not connected [Connect]

4. Delete Account

text

⚠️ Danger Zone
[Delete My Account]
- Requires confirmation
- Shows what will be deleted

5. Download My Data

text

[Download My Data]
- GDPR compliance
- Export profile, orders, addresses
- JSON or CSV format

📝 PROFILE FIELDS DETAILED
Required Fields

text

First Name:
- Type: text
- Min: 2 chars
- Max: 50 chars
- Pattern: Letters, spaces

Last Name:
- Type: text
- Min: 2 chars
- Max: 50 chars
- Pattern: Letters, spaces

Email:
- Type: email
- Validation: RFC 5322
- Unique in system
- Requires verification on change

Optional Fields

text

Phone:
- Type: tel
- Format: Nepal (+977)
- Pattern: 10 digits

Date of Birth:
- Type: date
- Max: Today (past dates only)
- Min age: None enforced

Gender:
- Type: select
- Options: Male, Female, Other, Prefer not to say

Profile Photo:
- Type: image
- Formats: JPG, PNG, GIF
- Max size: 5MB
- Dimensions: Auto-cropped to square