HOLCIM OUTBOUND FOLLOW-UP

Dedicated Genesys Cloud outbound script for Holcim Servicing Contacts.
It displays the 14 fields used by the website and supplied contact-list template.
The layout has four sections: Customer & callback, Project & materials,
Enquiry & timing, and Handoff & next action. Blank fields remain blank and the
agent is prompted to confirm incomplete information with the customer.

Outbound is enabled and the script is associated with the existing list:
Holcim Servicing Contacts — 3b27387e-d010-49ce-965f-13b0b8b85d2d.
The list's callbackNumber column was verified as the Work phone column.
All values use native {{Outbound.<columnName>}} bindings. No API credentials,
customer example records or custom variables with matching names are included.
The script displays data; it does not write back to the list or book callbacks.

To use in an outbound campaign, choose the published Holcim Outbound Follow-up
script in the campaign's Script setting, using the same contact list. Publishing
the script alone does not start a campaign or change campaign dialing settings.
Preview displays bracketed Outbound variable names instead of live contact data.

The .script file is a native import artifact. Import it through the Scripts UI
into the Holcim Demo division. Genesys assigns new script/org identities on import.
Check Script Properties > Outbound and the contact-list association before
publishing or reusing the artifact in a different organisation.

Reference for native contact-column binding:
https://help.genesys.cloud/articles/associate-script-contact-list/
