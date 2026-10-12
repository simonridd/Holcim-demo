HOLCIM DEMO — GITHUB PAGES WITH GENESYS PKCE
No Python, Node, installation, build step or client secret required.

PUBLISH USING YOUR BROWSER
1. Create or choose a dedicated GitHub demo repository. On GitHub Free, Pages
   requires a public repository. Ordinary Pages publication is publicly reachable.
2. Extract the ZIP and upload these files to the repository ROOT, not the ZIP:
   index.html
   contact-template.js
   quote/ (all route assets)
   genesys-sdk-264.0.0.min.js
   GENESYS_SDK_LICENSE.txt
   .nojekyll (optional but recommended; disables Jekyll processing)
   You can upload README.txt too. If .nojekyll is hidden in your file picker, create
   it with GitHub's Add file > Create new file and commit the empty file.
3. Repository Settings > Pages > Deploy from a branch > main > /(root) > Save.
4. Open the HTTPS site URL shown in Pages settings. Messenger is already embedded.
   Use the actual GitHub-returned URL, not a guessed owner/repository URL.

CONFIGURE OAUTH IN GENESYS CLOUD
1. Create an OAuth client using Code Authorization / PKCE (not Client Credentials).
2. Open the published website, click Presenter setup and copy the displayed
   redirect URI. Add that EXACT URI to the client's authorised redirect URIs.
   The root /repo/ URL and /repo/index.html are different redirect URIs: use the
   same published URL consistently, or register both if you need both.
3. Select minimum scopes for token validation and the outbound contact-list APIs
   used by the app. Verify those scopes against your tenant's API Explorer.
   The signing-in user must be allowed to view the list and add contacts in its
   division. OAuth does not bypass their permissions.
4. No client secret is used. Even if Genesys displays one for the OAuth client,
   do not put it in the page, repository, setup panel or conversation.

PRESENTER SETUP / RUNNING THE DEMO
1. In Presenter setup, choose your region (Ireland is the default), enter the
   OAuth client ID and outbound contact-list ID.
2. Edit the JSON column mapping to match the list's exact column names. Defaults match the 14 columns of Holcim Servicing Contact Template:
   customerName, callbackNumber, projectName, siteLocation, requiredDate,
   coreProduct, productQuantity, quantityUnit, customerCompany, enquiryDetails,
   requestedTiming, handoffReason, nextAction, contextSource.
   All columns need mappings, but captured values may be blank. callbackNumber
   must be the list's Work phone column. Use the contact-list ID, not template ID
   acc74b73-8ade-4282-91d6-ac5fd19b0461. Old saved mappings are replaced by
   the template defaults on read, retaining public OAuth/client/list settings.
3. Save setup, then Sign into Genesys. Sign in as your authorised Genesys user.
   After redirecting back, the app checks the contact-list columns. If mapping
   fails, it displays the actual column names so you can correct setup and sign
   in again. If access fails, check scopes, user roles and division access.
4. Once GENESYS SIGNED IN appears, fill the form with fictional demo details,
   review the enquiry, then Send enquiry. Confirm the contact in Genesys Cloud.
5. New enquiry starts another submission after an explicit duplicate-check prompt.
   If a submission result is uncertain, check the list before sending again.
6. Disconnect API clears this page's access token and disables submission. It does
   not end your Genesys SSO or Messenger session. Refreshing the page also loses
   the in-memory access token; sign in again. Public configuration stays only
   for the browser tab's session. No form/customer values are saved in storage.

WHAT THE FORM DOES
POST /api/v2/outbound/contactlists/<list-id>/contacts with one contact.
All project/contact inputs are optional; permission to contact remains required.
Names are combined into customerName; address/postcode form siteLocation.
Email and contact permission are retained in enquiryDetails; article context goes
into contextSource. Missing details are blank. Records with a callback number
are callable; records without a number have callable=false.
This creates an outbound-list record, not an External Contact/CRM person, order,
interaction or scheduled callback. An active campaign using that list may call
new contacts. Use a dedicated demonstration list and fictional details.
priority=false does not stop campaign dialling. doNotQueue=true has no effect
on new contacts. No automatic POST retries are made. A network error can occur
AFTER Genesys accepts a contact; check before retrying.

MESSENGER
Your supplied prod-euw1 deployment is already embedded:
f292c45a-761b-4b51-80df-fcfdfc89a6a6.
It works independently from presenter OAuth sign-in. Ensure the Messenger
configuration/deployment is active with a published inbound message flow.
Allow all domains is the testing/development option; restrict to the published
hostname for wider use as appropriate. Internet access is required.

SECURITY / SCOPE
PKCE lets an authorised Genesys user sign in through a public browser app without
a client secret. It is suitable for a presenter-run demo. An anonymous customer
on their own device cannot use this page to create contacts without a Genesys
user login. A real unattended customer enquiry form still needs a backend.
The SDK handles PKCE generation and token exchange; the application validates
OAuth state and callback age before exchanging the code. Access/refresh tokens
are held in memory only. The SDK stores a temporary verifier in sessionStorage
for the redirect. Public setup settings and OAuth state also use sessionStorage.
SDK request/body logging is disabled. Referrer policy is no-referrer.
User inputs are rendered with textContent. Never commit tokens or secrets.

DEPENDENCY REVIEW
Genesys official purecloud-platform-client-v2 browser SDK 264.0.0 is included,
with its MIT licence. Release metadata: 8 October 2026. Actively maintained by
Genesys. Direct package OSV query on 12 October 2026 returned no advisories.
This is not a full scan of transitive bundled components. The browser bundle is
pinned and checked with SHA-384 integrity. The alternative is a hosted API using
server-side credentials, which is unnecessary for this signed-in demo.

VERIFICATION / LIMITS
Passed: inline script syntax, HTML IDs/labels, official SDK loading and expected
PKCE interfaces, region/persistence/logging configuration, public-config validation,
column checks, payload/context mapping, rejected callback state before exchange,
mocked successful contact creation, duplicate-submit suppression and uncertain
failure messages. Messenger embed occurs once. No local runtime is required.
Browser visual QA and actual OAuth/Genesys submissions have NOT been performed:
the published URL, OAuth client ID, list ID and user permissions were not supplied.
This package is prepared for upload; it has not been deployed to GitHub Pages.

CONTENT
Includes the current 12 demo knowledge articles, Holcim logo and quarry photo.
The page is labelled as a demonstration. Product guidance and proposed advisor
notes require review; verify permission for broader use of Holcim assets.

REFERENCES
https://developer.genesys.cloud/authorization/platform-auth/use-pkce
https://developer.genesys.cloud/api/rest/client-libraries/javascript/
https://github.com/MyPureCloud/platform-client-sdk-javascript
https://help.genesys.cloud/articles/create-an-oauth-client/
https://help.genesys.cloud/articles/deploy-messenger/
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

AI-ASSISTED OUTPUT — REVIEW BEFORE USE
Generated/updated 12 October 2026 by Codex. Inputs: current Holcim demo, supplied
Messenger snippet, official Genesys SDK/source/docs and GitHub Pages docs.
Scope: static browser demo with presenter PKCE and contact-list submission.
Assumptions: authorised user, correct OAuth redirect/scopes, dedicated demo list.
Review: public content, brand permission, OAuth/client/list settings, live login,
contact creation and campaign behaviour. No real credentials or customer records
were included, no live contacts created and no deployment performed.
