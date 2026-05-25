### Goal

We will merge the functionality of the standalone campaign list screen into the campaign details screen, creating a unified dashboard layout. 

The existing logic for fetching and displaying campaigns (currently in `/src/renderer/screens/CampaignList.tsx`) will be preserved and moved into a new React component called `CampaignSidebar.tsx`. This component will be rendered as a left sidebar alongside the main campaign details content.

### Routing & State

- The standalone `campaign-list` route will be removed.
- The application will boot directly into this new unified dashboard layout.
- We will manage a `selectedCampaignId` in state. 
- **Empty State:** If no campaign is selected (e.g., when the app first opens), the main content area will display an "empty state" (such as a welcome message or a prompt to select/create a campaign), rather than defaulting to a random campaign.

### New Layout Structure

--------------------------------
| Header                       |
--------------------------------
| left side bar | main content |
| (Campaigns)   | (Details)    |
--------------------------------