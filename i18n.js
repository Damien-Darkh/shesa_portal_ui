// i18n.js - UI translation. The English text already in the HTML/JS is the key; Italian is the default language.
// Any exact-match string is translated automatically (initial page + everything added later by JS), so pages
// need no markup changes. Strings not listed here simply stay in English.
// Flask: replace with Flask-Babel + a User.language column (default 'it'); this file goes away.

const IT = {
  // shared
  'Employee Portal': 'Portale dipendenti', 'Dashboard': 'Dashboard', 'Directory': 'Rubrica', 'Profile': 'Profilo',
  'Admin Panel': 'Pannello admin', 'Log out': 'Esci', 'Notifications': 'Notifiche', 'Skip to main content': 'Vai al contenuto principale',
  'Toggle navigation': 'Mostra/nascondi navigazione', 'Main': 'Principale', 'Cancel': 'Annulla', 'Close': 'Chiudi',
  'Save changes': 'Salva modifiche', 'Back to employees': 'Torna ai dipendenti', 'Administration': 'Amministrazione',
  'Active': 'Attivo', 'Disabled': 'Disattivato', 'Admin': 'Admin', 'Staff': 'Dipendente', 'ADMIN': 'ADMIN', 'STAFF': 'DIPENDENTE',
  'Edit': 'Modifica', 'Delete': 'Elimina', 'Status': 'Stato', 'Name': 'Nome', 'Role': 'Ruolo', 'Devices': 'Dispositivi',
  'Device': 'Dispositivo', 'Address': 'Indirizzo', 'Added': 'Aggiunto', 'Disconnect': 'Disconnetti', 'Reconnect': 'Riconnetti',
  'Disconnected': 'Disconnesso', 'Optional': 'Facoltativo', 'Required': 'Obbligatorio', 'New': 'Nuova',
  'First name': 'Nome', 'Last name': 'Cognome', 'Email address': 'Indirizzo email', 'Job title': 'Ruolo lavorativo',
  'Department': 'Reparto', 'Phone': 'Telefono', 'Office location': 'Sede / ufficio', 'Bio': 'Bio', 'Description': 'Descrizione',
  // dashboard
  'Overview': 'Panoramica', 'Personal Details': 'Dati personali', 'Office Location': 'Sede', 'Start Date': 'Data di inizio',
  'About': 'Informazioni', 'VPN Devices': 'Dispositivi VPN', 'Add Device': 'Aggiungi dispositivo',
  'Windows setup file': 'File di configurazione Windows', 'No notifications.': 'Nessuna notifica.',
  'No devices yet — add one above to get connected.': 'Nessun dispositivo: aggiungine uno per connetterti.',
  // profile
  'My Profile': 'Il mio profilo', 'Account': 'Account', 'Personal details': 'Dati personali',
  'Your details are managed by an administrator. You can change your NAS password below.': 'I tuoi dati sono gestiti da un amministratore. Qui sotto puoi cambiare la password del NAS.',
  'Contact an admin if any of these details need to change.': 'Contatta un amministratore se questi dati devono cambiare.',
  'Profile fields can only be edited by an administrator in the admin panel.': 'I dati del profilo possono essere modificati solo da un amministratore nel pannello admin.',
  'NAS password': 'Password NAS', 'Change NAS password': 'Cambia password NAS', 'Interface language': 'Lingua dell\'interfaccia',
  'Choose the language used across the portal. Italian is the default.': 'Scegli la lingua usata nel portale. Il predefinito è l\'italiano.', 'Language': 'Lingua',
  // directory
  'Organization': 'Organizzazione', 'Directory & Onboarding': 'Rubrica e onboarding', 'Find people': 'Cerca persone',
  'Employee Directory': 'Elenco dipendenti', 'All departments': 'Tutti i reparti', 'Filter by department': 'Filtra per reparto',
  'Search by name, email, or job title…': 'Cerca per nome, email o ruolo…', 'Search the directory': 'Cerca nella rubrica',
  // admin panel
  'Manage employees, review time off and see who is away.': 'Gestisci i dipendenti, approva le assenze e vedi chi è assente.',
  'Add Employee': 'Aggiungi dipendente', 'Employees': 'Dipendenti', 'Leave approvals': 'Approvazione ferie',
  'Leave calendar': 'Calendario assenze', 'Departments': 'Reparti', 'Admin sections': 'Sezioni admin', 'Pending': 'In attesa',
  'All requests': 'Tutte le richieste', 'You can\'t approve your own request; another admin has to.': 'Non puoi approvare la tua richiesta: deve farlo un altro admin.',
  'Employee': 'Dipendente', 'Type': 'Tipo', 'Dates': 'Date', 'Days': 'Giorni', 'Reason': 'Motivo', 'Approve': 'Approva', 'Deny': 'Rifiuta',
  'Approved': 'Approvato', 'Denied': 'Rifiutato', 'Your own request': 'La tua richiesta', 'No pending requests.': 'Nessuna richiesta in attesa.',
  'No requests yet.': 'Nessuna richiesta.', 'No employees yet. Add one to get started.': 'Nessun dipendente. Aggiungine uno per iniziare.',
  'All employees': 'Tutti i dipendenti', 'Filter by employee': 'Filtra per dipendente', 'Show pending requests': 'Mostra richieste in attesa',
  'Approved (solid)': 'Approvato (pieno)', 'Pending (dashed)': 'In attesa (tratteggiato)', 'Vacation': 'Ferie', 'Sick': 'Malattia',
  'Personal': 'Permesso personale', 'Duration': 'Durata', 'Decision note': 'Nota della decisione', 'Dates ': 'Date',
  'Add department': 'Aggiungi reparto', 'Parent department': 'Reparto superiore', 'Manager': 'Responsabile',
  'None (top level)': 'Nessuno (livello principale)', 'No manager': 'Nessun responsabile', 'Members': 'Membri',
  'Enter a department name.': 'Inserisci il nome del reparto.', 'A department with this name already exists.': 'Esiste già un reparto con questo nome.',
  'The calendar could not be loaded.': 'Impossibile caricare il calendario.', 'Check your connection and': 'Controlla la connessione e', 'try again': 'riprova',
  // add / edit employee
  'Fill out the employee information. Only office location, bio and photo are optional.': 'Compila i dati del dipendente. Solo sede, bio e foto sono facoltativi.',
  'Administrator (can manage employees, devices and leave)': 'Amministratore (può gestire dipendenti, dispositivi e ferie)',
  'A NAS account is created automatically. The employee gets a temporary password and must set their own at first sign-in.': 'L\'account NAS viene creato automaticamente. Il dipendente riceve una password temporanea e deve sceglierne una propria al primo accesso.',
  'Select a department': 'Seleziona un reparto', 'Add or edit departments': 'Aggiungi o modifica reparti', 'Avatar photo URL': 'URL foto profilo',
  'Browse...': 'Sfoglia...', 'Edit employee': 'Modifica dipendente', 'Access': 'Accesso', 'NAS account': 'Account NAS', 'NAS username': 'Username NAS',
  'Reset NAS password': 'Reimposta password NAS', 'Add a device for this employee': 'Aggiungi un dispositivo per questo dipendente',
  'Create VPN access': 'Crea accesso VPN', 'Danger zone': 'Zona pericolosa', 'Delete employee': 'Elimina dipendente', 'No devices.': 'Nessun dispositivo.',
  'Disabled: revokes all their devices immediately on save': 'Disattivato: revoca subito tutti i loro dispositivi al salvataggio',
  'Save access': 'Salva accesso', 'Save profile': 'Salva profilo', 'Employee not found.': 'Dipendente non trovato.',
  'You can\'t change your own admin or disabled status, or delete your own account.': 'Non puoi modificare il tuo stato di admin o disattivazione, né eliminare il tuo account.',
  'That email is already used by another account.': 'Questa email è già usata da un altro account.',
  'Enter a valid email address.': 'Inserisci un indirizzo email valido.',
  // error + standalone pages
  'Something went wrong': 'Qualcosa è andato storto', '500 · Server error': '500 · Errore del server',
  'Something went wrong on our side': 'Qualcosa è andato storto da parte nostra',
  'Your request didn\'t go through and nothing was changed. Try again in a moment. If it keeps happening, contact IT and quote the reference below.': 'La richiesta non è andata a buon fine e non è stato modificato nulla. Riprova tra un momento. Se il problema continua, contatta l\'IT indicando il riferimento qui sotto.',
  'Reference:': 'Riferimento:', 'Try again': 'Riprova', 'Back to dashboard': 'Torna alla dashboard',
  'Access denied': 'Accesso negato', '403 · Forbidden': '403 · Vietato', 'You don\'t have access to this page': 'Non hai accesso a questa pagina',
  'Your account doesn\'t have permission to view this. If you think this is a mistake, contact an admin.': 'Il tuo account non ha il permesso di visualizzare questa pagina. Se pensi sia un errore, contatta un amministratore.',
  'Page not found': 'Pagina non trovata', '404 · Not found': '404 · Non trovata', 'This page doesn\'t exist': 'Questa pagina non esiste',
  'The link may be broken, or the page may have moved. Check the URL, or head back to your dashboard.': 'Il link potrebbe essere errato o la pagina spostata. Controlla l\'URL oppure torna alla dashboard.',
  'Account disabled': 'Account disattivato', 'Your account has been disabled': 'Il tuo account è stato disattivato',
  'An administrator has disabled access for this account, and all of its VPN devices have been disconnected. Contact IT if you believe this is a mistake.': 'Un amministratore ha disattivato l\'accesso a questo account e tutti i suoi dispositivi VPN sono stati disconnessi. Contatta l\'IT se pensi sia un errore.',
  'Set your NAS password': 'Imposta la password del NAS', 'Action required': 'Azione richiesta',
  'You\'re using a temporary password.': 'Stai usando una password temporanea.',
  'Choose your own to continue. You can\'t open the portal until this is done.': 'Scegline una tua per continuare. Non potrai accedere al portale finché non lo fai.',
  'New password': 'Nuova password', 'Confirm new password': 'Conferma nuova password', 'Set password and continue': 'Imposta la password e continua',
  'Show password': 'Mostra password', 'Hide password': 'Nascondi password',
  'At least 8 characters': 'Almeno 8 caratteri', 'Upper and lower case letters': 'Lettere maiuscole e minuscole', 'At least one number': 'Almeno un numero',
  'Doesn\u2019t contain your name or username': 'Non contiene il tuo nome o username', 'Both passwords match': 'Le due password coincidono',
  // dialogs + misc
  'Actions': 'Azioni',
  'New leave request': 'Nuova richiesta di assenza', 'Leave approved': 'Assenza approvata', 'Leave denied': 'Assenza rifiutata', 'Leave request cancelled': 'Richiesta di assenza annullata',
  'Show less': 'Mostra meno', 'No notifications.': 'Nessuna notifica.',
  'Search employees': 'Cerca dipendenti', 'Search by name, email or job title…': 'Cerca per nome, email o ruolo…', 'Filter by role': 'Filtra per ruolo', 'Filter by status': 'Filtra per stato',
  'All roles': 'Tutti i ruoli', 'All statuses': 'Tutti gli stati', 'Rows per page': 'Righe per pagina', 'Previous': 'Precedente', 'Next': 'Successivo', 'Pagination': 'Paginazione',
  'No employees match your filters.': 'Nessun dipendente corrisponde ai filtri.', 'Clear filters': 'Azzera i filtri', 'From': 'Dal', 'To': 'Al',
  'Saving…': 'Salvataggio…', 'Fill in this field.': 'Compila questo campo.', 'Select an option.': 'Seleziona un\'opzione.', 'Tick this box to continue.': 'Seleziona questa casella per continuare.',
  'Enter a valid value.': 'Inserisci un valore valido.', 'Enter a valid web address.': 'Inserisci un indirizzo web valido.', 'Choose a valid date.': 'Scegli una data valida.',
  'The value doesn\'t match the required format.': 'Il valore non rispetta il formato richiesto.',
  'Back to department': 'Torna al reparto', 'Back to colleague': 'Torna al collega', 'Reset NAS password?': 'Reimpostare la password NAS?',
  'Reset password': 'Reimposta password', 'This employee has no NAS account': 'Questo dipendente non ha un account NAS',
  'The manager must be a member of this department or one of its sub-departments.': 'Il responsabile deve essere un membro di questo reparto o di uno dei suoi sotto-reparti.',
  'No employees yet: add employees to this department, then pick a manager.': 'Ancora nessun dipendente: aggiungi dipendenti a questo reparto, poi scegli un responsabile.',
  'Account details': 'Dettagli account', 'User ID': 'ID utente', 'WorkOS user ID': 'ID utente WorkOS', 'Created': 'Creato', 'Last profile update': 'Ultimo aggiornamento profilo',
  'NAS username': 'Username NAS', 'Not provisioned': 'Non configurato', 'Password change': 'Cambio password', 'Required at next sign-in': 'Richiesto al prossimo accesso', 'Not required': 'Non richiesto',
  'Organization chart': 'Struttura organizzativa', 'Department path': 'Percorso reparto', 'Manages': 'Responsabile di', 'Colleagues in department': 'Colleghi nel reparto',
  'Leave history': 'Storico assenze', 'Leave balances': 'Saldi ferie', 'Accrued': 'Maturati', 'Carryover': 'Riporto', 'Used': 'Usati', 'Remaining': 'Residui',
  'No leave requests.': 'Nessuna richiesta di assenza.', 'Disconnected (account disabled)': 'Disconnesso (account disattivato)', 'Decision note': 'Nota della decisione',
  'Admin actions': 'Azioni admin', 'Only visible to administrators': 'Visibile solo agli amministratori',
  'Back to departments': 'Torna ai reparti', 'Department not found.': 'Reparto non trovato.', 'Direct members of this department.': 'Membri diretti di questo reparto.',
  'Sub-departments': 'Sotto-reparti', 'Direct members': 'Membri diretti', 'Total members': 'Membri totali', 'Including sub-departments': 'Inclusi i sotto-reparti',
  'View profile': 'Vedi profilo', 'No members in this department.': 'Nessun membro in questo reparto.', 'Top level': 'Livello principale', 'None': 'Nessuno', 'Members': 'Membri',
  'Departments group employees and can be nested under a parent department.': 'I reparti raggruppano i dipendenti e possono essere annidati sotto un reparto superiore.',
  'Includes employees in sub-departments': 'Include i dipendenti dei sotto-reparti',
  'Edit department': 'Modifica reparto', 'Delete department?': 'Eliminare il reparto?', 'Can\'t delete this department': 'Impossibile eliminare questo reparto',
  'Move or delete its sub-departments first.': 'Sposta o elimina prima i suoi sotto-reparti.', 'Remove photo': 'Rimuovi foto',
  'Image too large (max 300 KB).': 'Immagine troppo grande (max 300 KB).', 'Only image files are allowed.': 'Sono ammessi solo file immagine.', 'Could not read the image.': 'Impossibile leggere l\'immagine.',
  '(Optional)': '(facoltativo)', 'NAS username:': 'Username NAS:',
  'Permanently deletes this employee, removes every device and their NAS account. Use Disabled above to suspend access temporarily.': 'Elimina definitivamente questo dipendente, rimuove ogni dispositivo e il suo account NAS. Usa "Disattivato" qui sopra per sospendere l\'accesso temporaneamente.',
  'Your username for the company file server is': 'Il tuo username per il file server aziendale è', 'NAS account management isn\'t enabled for your user.': 'La gestione dell\'account NAS non è attiva per il tuo utente.',
  'Confirm': 'Conferma', 'OK': 'OK', 'Cancelled': 'Annullata', 'Away': 'Assente', 'Data table': 'Tabella dati', 'No results found.': 'Nessun risultato.',
  'Deny this request?': 'Rifiutare questa richiesta?', 'You can add a reason for the employee.': 'Puoi aggiungere un motivo per il dipendente.',
  'Reason (optional)': 'Motivo (facoltativo)', 'Delete device?': 'Eliminare il dispositivo?', 'Disconnect device?': 'Disconnettere il dispositivo?',
  'Delete employee?': 'Eliminare il dipendente?', 'Cancel this request?': 'Annullare questa richiesta?', 'Keep request': 'Mantieni richiesta', 'Cancel request': 'Annulla richiesta',
  'This withdraws your pending request. You can submit a new one at any time.': 'Ritira la tua richiesta in attesa. Potrai inviarne una nuova in qualsiasi momento.',
  'Colleague': 'Collega', 'Back to directory': 'Torna alla rubrica',
  // add device
  'Add a Device': 'Aggiungi un dispositivo', 'VPN Access': 'Accesso VPN', 'Back to profile': 'Torna al profilo', 'Device Name': 'Nome del dispositivo',
  'Give this device a name you\'ll recognize later, e.g., "Work Laptop" or "Phone".': 'Dai a questo dispositivo un nome che riconoscerai, ad esempio "Portatile ufficio" o "Telefono".',
  'e.g. Work MacBook Pro': 'es. MacBook Pro ufficio', 'Create VPN Access': 'Crea accesso VPN',
  // device created
  'Set Up Device': 'Configura dispositivo', 'Set up Device': 'Configura dispositivo', 'VPN Setup': 'Configurazione VPN',
  'This configuration is shown only once.': 'Questa configurazione viene mostrata una sola volta.',
  'Scan the QR code or copy the configuration text into your WireGuard application now.': 'Scansiona il codice QR o copia il testo di configurazione nell\'app WireGuard adesso.',
  'Step 1': 'Passaggio 1', 'Step 2': 'Passaggio 2',
  'Install the WireGuard app on your device (iOS, Android, macOS, or Windows).': 'Installa l\'app WireGuard sul tuo dispositivo (iOS, Android, macOS o Windows).',
  'Scan this QR code from inside the WireGuard app ("Add Tunnel" → "Scan QR Code"):': 'Scansiona questo codice QR dall\'app WireGuard ("Aggiungi tunnel" → "Scansiona codice QR"):',
  'Manual Configuration Text': 'Testo di configurazione manuale', 'Copy config': 'Copia configurazione', 'Copied!': 'Copiato!', 'Done, back to profile': 'Fatto, torna al profilo',
  'On a Windows work computer?': 'Su un computer Windows aziendale?',
  'One file installs WireGuard if needed, connects it, and adds a shortcut to the company NAS.': 'Un unico file installa WireGuard se serve, lo collega e aggiunge un collegamento al NAS aziendale.',
  'Download Windows setup file': 'Scarica il file di configurazione Windows',
  'Works for one hour or until you run it. Windows may show a security prompt: choose "More info", then "Run anyway".': 'Valido per un\'ora o fino all\'esecuzione. Windows potrebbe mostrare un avviso di sicurezza: scegli "Ulteriori informazioni", poi "Esegui comunque".',
  // change NAS password
  'Set NAS Password': 'Imposta password NAS', 'Credentials': 'Credenziali', 'Set Your NAS Password': 'Imposta la tua password NAS',
  'Update your login credentials for company file servers (Synology NAS).': 'Aggiorna le credenziali di accesso ai file server aziendali (Synology NAS).',
  'Passwords must be at least 8 characters long, contain uppercase and lowercase letters, include at least one number, and must not contain your name.': 'La password deve avere almeno 8 caratteri, contenere lettere maiuscole e minuscole, almeno un numero e non deve contenere il tuo nome.',
  'New Password': 'Nuova password', 'Confirm New Password': 'Conferma nuova password', 'Repeat new password': 'Ripeti la nuova password', 'Set Password': 'Imposta password',
  'Passwords do not match.': 'Le password non coincidono.', 'Password updated': 'Password aggiornata', 'Your NAS password has been updated.': 'La tua password NAS è stata aggiornata.',
  // employee created
  'Employee Created': 'Dipendente creato', 'Account provisions successfully generated.': 'Account creato correttamente.',
  'This temporary credential is shown only once.': 'Questa credenziale temporanea viene mostrata una sola volta.',
  'Copy or record these details immediately before leaving this page.': 'Copia o annota subito questi dati prima di lasciare la pagina.',
  'DSM Username': 'Username DSM', 'Temporary Password': 'Password temporanea', 'Copy Temporary Password': 'Copia password temporanea', 'Back to Employee List': 'Torna all\'elenco dipendenti',
  // leave calendar (employee)
  'Time Off': 'Assenze', 'Leave Calendar': 'Calendario ferie', 'Request leave or see when your colleagues are away.': 'Richiedi un\'assenza o vedi quando sono assenti i colleghi.',
  'Request Leave': 'Richiedi assenza', 'Request leave': 'Richiedi assenza', 'Choose the dates and type of leave.': 'Scegli le date e il tipo di assenza.',
  'Leave type': 'Tipo di assenza', 'Start date': 'Data di inizio', 'End date': 'Data di fine', 'Notes (optional)': 'Note (facoltative)', 'Submit request': 'Invia richiesta',
  'My requests': 'Le mie richieste', 'You haven\'t requested any leave yet.': 'Non hai ancora richiesto assenze.', 'Colleagues (approved)': 'Colleghi (approvate)',
  'Choose both dates.': 'Scegli entrambe le date.', 'The end date can\'t be before the start date.': 'La data di fine non può precedere quella di inizio.',
  'Your selection only includes weekends.': 'La selezione include solo fine settimana.', 'This overlaps another request of yours.': 'Si sovrappone a un\'altra tua richiesta.',
  'Leave request submitted.': 'Richiesta di assenza inviata.', 'Request cancelled.': 'Richiesta annullata.',
};

const PATTERNS = [
  [/^1 result$/, '1 risultato'], [/^(\d+) results$/, '$1 risultati'],
  [/^Showing (\d+)–(\d+) of (\d+)$/, 'Mostrati $1–$2 di $3'], [/^Page (\d+) of (\d+)$/, 'Pagina $1 di $2'],
  [/^Use at least (\d+) characters\.$/, 'Usa almeno $1 caratteri.'], [/^Use at most (\d+) characters\.$/, 'Usa al massimo $1 caratteri.'],
  [/^Choose a date on or after (.+)\.$/, 'Scegli una data uguale o successiva al $1.'], [/^Choose a date on or before (.+)\.$/, 'Scegli una data uguale o precedente al $1.'],
  [/^Reset the NAS password for (.+)\? A temporary password is generated and they must set their own at next sign-in\.$/, 'Reimpostare la password NAS di $1? Verrà generata una password temporanea e dovrà sceglierne una propria al prossimo accesso.'],
  [/^(.+) no longer manages: (.+)\.$/, '$1 non è più responsabile di: $2.'],
  [/^\((\d+) direct\)$/, '($1 diretti)'],
  [/^Move its 1 employee to another department first\.$/, 'Sposta prima il suo dipendente in un altro reparto.'],
  [/^Move its (\d+) employees to another department first\.$/, 'Sposta prima i suoi $1 dipendenti in un altro reparto.'],
  [/^Delete "(.+)"\? This can't be undone\.$/, 'Eliminare "$1"? L\'operazione non si può annullare.'],
  [/^Department "(.+)" updated\.$/, 'Reparto "$1" aggiornato.'], [/^Department "(.+)" deleted\.$/, 'Reparto "$1" eliminato.'],
  [/^(.+) · Away$/, '$1 · Assente'],
  [/^Approved (.+)'s request\.$/, 'Richiesta di $1 approvata.'], [/^Denied (.+)'s request\.$/, 'Richiesta di $1 rifiutata.'],
  [/^(.+) already has an account\.$/, '$1 ha già un account.'], [/^The NAS username "(.+)" is already taken\.$/, 'Lo username NAS "$1" è già in uso.'],
  [/^Permanently delete (.+)\? This removes the VPN peer entirely and cannot be undone\.$/, 'Eliminare definitivamente $1? Il peer VPN verrà rimosso del tutto e l\'operazione non si può annullare.'],
  [/^Disconnect (.+)\? This device will lose VPN access immediately\.$/, 'Disconnettere $1? Il dispositivo perderà subito l\'accesso VPN.'],
  [/^Permanently delete (.+) and all of their devices\? This cannot be undone\.$/, 'Eliminare definitivamente $1 e tutti i suoi dispositivi? L\'operazione non si può annullare.'],
  [/^'(.+)' has been disconnected\.$/, '"$1" è stato disconnesso.'], [/^'(.+)' has been reconnected\.$/, '"$1" è stato riconnesso.'],
  [/^Set up "(.+)"$/, 'Configura "$1"'], [/^Account created for (.+)\.$/, 'Account creato per $1.'],
  [/^Welcome back, (.+)$/, 'Bentornato, $1'],
  [/^(\d+) active$/, '$1 attivi'],
  [/^1 day$/, '1 giorno'], [/^(\d+(?:\.\d+)?) days$/, '$1 giorni'],
  [/^Department "(.+)" added\.$/, 'Reparto "$1" aggiunto.'],
  [/^Saved changes for (.+)\.$/, 'Modifiche salvate per $1.'],
];

// notification texts (leave events). Types are translated by the functions below; dates stay ISO and are localised when shown.
const TYPE_IT = { vacation: 'ferie', sick: 'malattia', personal: 'permesso personale' };
const TY = '(vacation|sick|personal)';
PATTERNS.push(
  [new RegExp(`^(.+) requested ${TY} leave from (\\S+) to (\\S+)\\.$`), (_, who, ty, a, b) => `${who} ha richiesto ${TYPE_IT[ty]} dal ${a} al ${b}.`],
  [new RegExp(`^(.+) cancelled their ${TY} leave from (\\S+) to (\\S+)\\.$`), (_, who, ty, a, b) => `${who} ha annullato la richiesta di ${TYPE_IT[ty]} dal ${a} al ${b}.`],
  [new RegExp(`^Your ${TY} leave from (\\S+) to (\\S+) was approved\\.$`), (_, ty, a, b) => `La tua richiesta di ${TYPE_IT[ty]} dal ${a} al ${b} è stata approvata.`],
  [new RegExp(`^Your ${TY} leave from (\\S+) to (\\S+) was denied\\.$`), (_, ty, a, b) => `La tua richiesta di ${TYPE_IT[ty]} dal ${a} al ${b} è stata rifiutata.`],
  [/^Show all \((\d+)\)$/, 'Mostra tutte ($1)'],
);

const KEY = 'portal.lang';
export const LANGS = { it: 'Italiano', en: 'English' };
export function getLang() { try { return localStorage.getItem(KEY) || 'it'; } catch { return 'it'; } }
export function setLang(l) { try { localStorage.setItem(KEY, l); } catch { /* ignore */ } }

const norm = s => s.replace(/\s+/g, ' ').trim();
export function t(s) {
  if (getLang() !== 'it' || typeof s !== 'string') return s;
  const k = norm(s);
  if (IT[k]) return IT[k];
  for (const [re, out] of PATTERNS) if (re.test(k)) return k.replace(re, out);
  return s;
}

export function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso.slice(0, 10) + 'T00:00:00').toLocaleDateString(getLang() === 'it' ? 'it-IT' : 'en-GB');
}

/** "2 hours ago" / "2 ore fa" in the app language. */
export function fmtRelative(iso) {
  const rtf = new Intl.RelativeTimeFormat(getLang() === 'it' ? 'it' : 'en', { numeric: 'auto' });
  const s = (new Date(iso) - Date.now()) / 1000, a = Math.abs(s);
  const [v, unit] = a < 60 ? [s, 'second'] : a < 3600 ? [s / 60, 'minute'] : a < 86400 ? [s / 3600, 'hour'] : a < 2592000 ? [s / 86400, 'day'] : [s / 2592000, 'month'];
  return rtf.format(Math.round(v), unit);
}

const ATTRS = ['placeholder', 'aria-label', 'title'];
const SKIP = /^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/;
function tx(node) {
  if (node.nodeType === 3) {
    const m = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m[2]) return;
    const out = t(m[2]);
    if (out !== m[2]) node.nodeValue = m[1] + out + m[3];
  } else if (node.nodeType === 1 && !node.hasAttribute('data-no-i18n')) {
    ATTRS.forEach(a => { const v = node.getAttribute(a); if (v) { const o = t(v); if (o !== v) node.setAttribute(a, o); } });
    if (!SKIP.test(node.tagName)) node.childNodes.forEach(tx);
  }
}

/** Sets <html lang>, translates the page and keeps translating whatever JS adds afterwards. */
export function applyTranslations() {
  const lang = getLang();
  document.documentElement.lang = lang;
  if (lang !== 'it') return;
  document.title = document.title.split(' - ').map(t).join(' - ');
  tx(document.body);
  new MutationObserver(ms => ms.forEach(m => {
    if (m.type === 'characterData') tx(m.target); else m.addedNodes.forEach(tx);
  })).observe(document.body, { childList: true, subtree: true, characterData: true });
}
