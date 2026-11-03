// MST UAE catalogue: every department and product line the site offers.
// `key` is the name a line carries on the visitor's quote (kept stable so saved lists survive redesigns).
window.MST = {
  phone: '055 645 6595',
  phoneIntl: '+971556456595',
  whatsapp: '971556456595',
  email: 'sales@mst-uae.com',

  departments: [
    {
      id: 'laptops', name: 'Laptops', image: 'assets/cat-laptops.jpg', pos: '60% 50%',
      blurb: 'Business, everyday, Apple and creator laptops with the maker’s warranty.',
      items: [
        { id: 'business-laptops', key: 'Business laptops', title: 'Business laptops', line: 'Dell Latitude, HP ProBook and EliteBook, Lenovo ThinkPad', brands: ['Dell', 'HP', 'Lenovo'] },
        { id: 'everyday-laptops', key: 'Everyday laptops', title: 'Everyday laptops', line: 'Dell Inspiron, HP Pavilion, Lenovo IdeaPad, ASUS Vivobook', brands: ['Dell', 'HP', 'Lenovo', 'ASUS'] },
        { id: 'apple-macbook', key: 'Apple MacBook', title: 'Apple MacBook', line: 'MacBook Air and MacBook Pro, with UAE warranty', brands: ['Apple'] },
        { id: 'creator-gaming-laptops', key: 'Creator and gaming laptops', title: 'Creator & gaming laptops', line: 'ASUS ROG, MSI, Dell Alienware, Lenovo Legion', brands: ['ASUS', 'MSI', 'Dell', 'Lenovo'] },
        { id: 'rugged-2in1', key: 'Rugged and 2-in-1 laptops', title: 'Rugged & 2-in-1', line: 'Dell Latitude Rugged, Microsoft Surface Pro', brands: ['Dell', 'Microsoft'] },
      ],
    },
    {
      id: 'desktops', name: 'Desktops & monitors', image: 'assets/cat-desktops.jpg', pos: '50% 35%',
      blurb: 'Office desktops, all-in-ones, workstations and displays up to 34″.',
      items: [
        { id: 'business-desktops', key: 'Business desktops', title: 'Business desktops', line: 'Dell OptiPlex, HP ProDesk, Lenovo ThinkCentre', brands: ['Dell', 'HP', 'Lenovo'] },
        { id: 'all-in-ones', key: 'All-in-one PCs', title: 'All-in-ones', line: 'HP and Lenovo, 24″ and 27″', brands: ['HP', 'Lenovo'] },
        { id: 'workstations', key: 'Workstations', title: 'Workstations', line: 'Dell Precision, HP Z, Lenovo ThinkStation', brands: ['Dell', 'HP', 'Lenovo'] },
        { id: 'monitors', key: 'Monitors', title: 'Monitors', line: 'Dell, HP, LG, Samsung, from 22″ to 34″ ultrawide', brands: ['Dell', 'HP', 'LG', 'Samsung'] },
        { id: 'custom-pc', key: 'Custom-built PC', title: 'Custom-built PCs', line: 'Assembled and tested in Deira to your specification', brands: [], kind: 'service' },
      ],
    },
    {
      id: 'accessories', name: 'Accessories', image: 'assets/cat-accessories.jpg', pos: '50% 50%',
      blurb: 'Keyboards to UPS units: everything a desk needs beside the computer.',
      items: [
        { id: 'keyboards-mice', key: 'Keyboards and mice', title: 'Keyboards & mice', line: 'Logitech, Microsoft, Dell, wired and wireless', brands: ['Logitech', 'Microsoft', 'Dell'] },
        { id: 'headsets-webcams', key: 'Headsets and webcams', title: 'Headsets & webcams', line: 'Logitech, Jabra, Poly, for Teams and Zoom calls', brands: ['Logitech', 'Jabra', 'Poly'] },
        { id: 'docks-hubs', key: 'Docking stations and hubs', title: 'Docks & hubs', line: 'USB-C and Thunderbolt docking stations', brands: [] },
        { id: 'storage-upgrades', key: 'Storage and upgrades', title: 'Storage & upgrades', line: 'SSDs, RAM, external drives, flash drives', brands: [] },
        { id: 'cables-adapters', key: 'Cables and adapters', title: 'Cables & adapters', line: 'HDMI, DisplayPort, USB-C, network patch cords', brands: [] },
        { id: 'ups-power', key: 'UPS and power', title: 'UPS & power', line: 'APC and Eaton, from desk units to rack mount', brands: ['APC', 'Eaton'] },
        { id: 'bags', key: 'Laptop bags and sleeves', title: 'Bags & sleeves', line: 'Targus, Dell, HP', brands: ['Targus', 'Dell', 'HP'] },
      ],
    },
    {
      id: 'software', name: 'Software & licences', image: 'assets/cat-software.jpg', pos: '50% 50%',
      blurb: 'Windows, Microsoft 365, Adobe and BizApp365 ERP, licensed to your company.',
      items: [
        { id: 'windows', key: 'Windows 11 Pro licence', title: 'Windows 11 Pro & Home', line: 'OEM and retail keys, invoiced to your company', brands: ['Microsoft'], kind: 'software' },
        { id: 'windows-server', key: 'Windows Server with CALs', title: 'Windows Server', line: '2022 and 2025, with user and device CALs', brands: ['Microsoft'], kind: 'software' },
        { id: 'm365', key: 'Microsoft 365 Business seats', title: 'Microsoft 365', line: 'Business Basic, Standard and Premium seats', brands: ['Microsoft'], kind: 'software' },
        { id: 'office-2024', key: 'Office 2024 Home and Business', title: 'Office 2024', line: 'Home & Business, one-time licence', brands: ['Microsoft'], kind: 'software' },
        { id: 'adobe-cc', key: 'Adobe Creative Cloud', title: 'Adobe Creative Cloud', line: 'All Apps, Photoshop, Illustrator, Acrobat Pro', brands: ['Adobe'], kind: 'software' },
        { id: 'bizapp365', key: 'BizApp365 ERP', title: 'BizApp365 ERP', line: 'Accounts, inventory and sales, set up for UAE VAT', brands: ['BizApp365'], kind: 'software' },
        { id: 'antivirus', key: 'Antivirus and endpoint protection', title: 'Antivirus & endpoint', line: 'Kaspersky, ESET, Bitdefender, Sophos', brands: ['Kaspersky', 'ESET', 'Bitdefender', 'Sophos'], kind: 'software' },
      ],
    },
    {
      id: 'networking', name: 'Networking', image: 'assets/cat-networking.jpg', pos: '50% 45%',
      blurb: 'Switches, firewalls, Wi-Fi and structured cabling, installed and labelled.',
      items: [
        { id: 'switches', key: 'Network switches', title: 'Switches', line: 'Cisco, Aruba, TP-Link Omada, Ubiquiti UniFi', brands: ['Cisco', 'Aruba', 'TP-Link', 'Ubiquiti'] },
        { id: 'routers-firewalls', key: 'Routers and firewalls', title: 'Routers & firewalls', line: 'Fortinet FortiGate, Sophos, MikroTik', brands: ['Fortinet', 'Sophos', 'MikroTik'] },
        { id: 'wifi', key: 'Wi-Fi access points', title: 'Wi-Fi access points', line: 'Ubiquiti UniFi, Aruba Instant On, TP-Link', brands: ['Ubiquiti', 'Aruba', 'TP-Link'] },
        { id: 'cabling', key: 'Structured cabling', title: 'Structured cabling', line: 'Cat6 and Cat6A points and fibre, tested and labelled', brands: [], kind: 'service' },
        { id: 'racks', key: 'Racks and patch panels', title: 'Racks & patch panels', line: 'Wall and floor racks, cable management', brands: [] },
        { id: 'network-setup', key: 'Network set-up', title: 'Network set-up', line: 'VLANs, VPN for remote staff, guest Wi-Fi', brands: [], kind: 'service' },
      ],
    },
    {
      id: 'servers', name: 'Servers & storage', image: 'assets/cat-servers.jpg', pos: '50% 45%',
      blurb: 'Rack and tower servers, NAS and backup that is actually test-restored.',
      items: [
        { id: 'servers', key: 'Servers', title: 'Servers', line: 'Dell PowerEdge, HPE ProLiant, Lenovo ThinkSystem', brands: ['Dell', 'HPE', 'Lenovo'] },
        { id: 'nas', key: 'NAS storage', title: 'NAS storage', line: 'Synology and QNAP, supplied with drives', brands: ['Synology', 'QNAP'] },
        { id: 'backup', key: 'Backup set-up', title: 'Backup', line: 'On-site and cloud backup, set up and test-restored', brands: [], kind: 'service' },
        { id: 'file-sharing', key: 'File sharing and permissions', title: 'File sharing', line: 'Shared drives and folder permissions by team', brands: [], kind: 'service' },
      ],
    },
    {
      id: 'printers', name: 'Printers & POS', image: 'assets/cat-printers.jpg', pos: '50% 50%',
      blurb: 'Office printers, copiers, original toner, POS and barcode kit.',
      items: [
        { id: 'office-printers', key: 'Office printers', title: 'Office printers', line: 'HP, Canon, Epson, Brother, laser and ink tank', brands: ['HP', 'Canon', 'Epson', 'Brother'] },
        { id: 'copiers', key: 'Multifunction copiers', title: 'Multifunction copiers', line: 'A3 and A4, print, scan and copy', brands: [] },
        { id: 'toner', key: 'Toner and ink', title: 'Toner & ink', line: 'Original cartridges for HP, Canon, Epson and Brother', brands: ['HP', 'Canon', 'Epson', 'Brother'] },
        { id: 'pos', key: 'POS terminals', title: 'POS terminals', line: 'Touch POS, receipt printers, cash drawers', brands: [] },
        { id: 'barcode', key: 'Barcode scanners and label printers', title: 'Barcode & labels', line: 'Zebra and Honeywell scanners and label printers', brands: ['Zebra', 'Honeywell'] },
      ],
    },
    {
      id: 'cctv', name: 'CCTV & access control', image: 'assets/cat-cctv.jpg', pos: '55% 50%',
      blurb: 'IP cameras, recorders, door access and time attendance.',
      items: [
        { id: 'ip-cameras', key: 'IP cameras', title: 'IP cameras', line: 'Hikvision, Dahua, indoor and outdoor', brands: ['Hikvision', 'Dahua'] },
        { id: 'nvr', key: 'NVR recorders', title: 'Recorders', line: 'NVRs with storage sized to your retention period', brands: [] },
        { id: 'door-access', key: 'Door access control', title: 'Door access', line: 'Card and fingerprint readers, ZKTeco', brands: ['ZKTeco'] },
        { id: 'time-attendance', key: 'Time attendance terminals', title: 'Time attendance', line: 'Fingerprint and face terminals for payroll', brands: [] },
      ],
    },
    {
      id: 'support', name: 'IT support & AMC', image: 'assets/cat-support.jpg', pos: '50% 45%',
      blurb: 'Maintenance contracts, on-site and remote support, repairs and upgrades.',
      items: [
        { id: 'amc', key: 'Annual maintenance contract', title: 'Annual maintenance contract', line: 'Scheduled visits and priority call-outs', brands: [], kind: 'service' },
        { id: 'onsite', key: 'On-site support visit', title: 'On-site support', line: 'Across Dubai, same or next working day', brands: [], kind: 'service' },
        { id: 'remote', key: 'Remote support', title: 'Remote support', line: 'For the problems that don’t need a visit', brands: [], kind: 'service' },
        { id: 'migration', key: 'Data migration', title: 'Data migration', line: 'Old PC to new, mail and files moved across', brands: [], kind: 'service' },
        { id: 'repair', key: 'Laptop and desktop repair', title: 'Repairs & upgrades', line: 'Screens, keyboards, batteries, SSD and RAM', brands: [], kind: 'service' },
      ],
    },
  ],

  // what comes with each kind of line, shown in the quick view
  includes: {
    hardware: ['Maker’s warranty, with claims handled through MST', 'Tax invoice with 5% VAT', 'Delivery across the UAE, set-up on request'],
    software: ['Licensed and invoiced to your company', 'Activated and set up on request', 'Renewal dates kept on file'],
    service: ['Quoted as its own line', 'Booked at a time that suits the office', 'Carried out by the MST UAE team'],
  },
};

// flat list of lines with their department attached, for search and the catalogue
window.MST.items = window.MST.departments.flatMap((d) =>
  d.items.map((i) => ({ ...i, kind: i.kind || 'hardware', dept: d.id, deptName: d.name })));
