
export const en = {
  common: {
    dashboard: "Dashboard",
    inbox: "Inbox",
    orders: "Orders",
    contentLibrary: "Content Library",
    automation: "Automation",
    settings: "Settings",
    notifications: "Notifications",
    contacts: "Contacts",
    analytics: "Analytics",
    logout: "Logout",
    welcome: "Welcome back",
    arabicEnabled: "Arabic Language Enabled",
    switchLanguage: "Switch to Arabic",
    loading: "Loading...",
    permissionsDebug: "Permission Controls (Admin Only)",
    actions: "Actions",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    search: "Search...",
    filter: "Filter",
    confirmDelete: "Are you sure you want to delete this item?",
    noData: "No data found",
    all: "All",
    image: "Image",
    madeWithLove: "Made with ❤️ by Mohamed Alaa",
    menu: "Menu",
    pinned: "Pinned",
    recent: "Recent",
    export: "Export",
    upload: "Upload",
    download: "Download",
    back: "Back",
    next: "Next",
    close: "Close",
    create: "Create",
    update: "Update",
    viewDetails: "View Details",
    status: "Status",
    currencySar: "SAR"
  },
  auth: {
    loginTitle: "Log in to Guthmi WA",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    loginButton: "Log In",
    forgotPassword: "Forgot password?",
    error: "Invalid credentials"
  },
  nav: {
    templates: "Templates",
    flows: "Flows",
    quickReplies: "Quick Replies",
    autoReplies: "Auto Replies",
    chatbot: "Chatbot Builder",
    knowledgeBase: "Knowledge Base",
    campaigns: "Campaigns",
    allContacts: "All Contacts",
    lists: "Lists",
    tags: "Tags",
    segments: "Smart Segments",
    importExport: "Import / Export",
    messagingAnalytics: "Messaging Analytics",
    notificationAnalytics: "Notification Analytics",
    botAnalytics: "Bot Analytics"
  },
  dashboard: {
    title: "Executive Dashboard",
    desc: "High-level overview. Click cards for details.",
    export: "Export Report",
    protection: {
      title: "Smart Protection Layer",
      warmup: "Warm-Up Mode",
      queue: "Queue",
      rate: "Rate",
      estTime: "Est. Time",
      health: "System Health"
    },
    system: {
      title: "System Health",
      operational: "All Systems Operational",
      apiConnected: "WhatsApp API Connected",
      webhooksActive: "Webhooks Active"
    },
    quickAction: {
      title: "Need a Report?",
      desc: "Export detailed CSV reports for your team.",
      btn: "Go to Analytics"
    },
    stats: {
      totalMessages: "Total Messages",
      activeConversations: "Active Conversations",
      readRate: "Read Rate",
      failedRate: "Failed Rate",
      totalCost: "Total Cost"
    },
    trends: {
      increase: "increase",
      decrease: "decrease"
    }
  },
  inbox: {
    title: "Unified Inbox",
    noSelection: "Select a conversation to start chatting",
    filters: {
      highPriority: "High Priority",
      b2b: "B2B",
      b2c: "B2c",
      unassigned: "Unassigned"
    },
    tabs: {
      all: "All",
      mine: "Mine",
      unread: "Unread"
    },
    closeModal: {
      title: "Close Conversation",
      desc: "The conversation will be closed and a feedback request will be sent via WhatsApp.",
      sendFeedback: "Send feedback request",
      closeChat: "Close conversation now",
      confirm: "Confirm Close",
      cancel: "Cancel",
      systemMessage: "Conversation closed"
    },
    chat: {
      typing: "is typing...",
      takeOver: "Take Over",
      lockedBy: "Conversation is locked by",
      lockedWarning: "This conversation is locked by another agent.",
      windowClosed: "24h Window Closed. Only Templates allowed. Use Internal Note for team communication.",
      windowOpen: "24h Window Open",
      inputPlaceholder: "Type a message... (Type / for quick replies)",
      privateNote: "Internal Note",
      privateNotePlaceholder: "Add a private note for the team...",
      quickRepliesTitle: "Quick Replies",
      quickRepliesHint: "Type / to insert",
      assignAgent: "Assign Agent",
      selectAgent: "Select Agent",
      selectTag: "Select a tag:",
      context: {
        campaign: "Campaign Context",
        replyFrom: "Reply from Campaign",
        source: "Source",
        routing: "Routing to"
      },
      actions: {
        closeFeedback: "Close & Request Feedback",
        confirmClose: "Close this chat and request feedback from the customer?",
        assignAgent: "Assign Agent",
        selectAgent: "Select Agent",
        bulkSelected: "Selected",
        bulkDelete: "Delete",
        bulkRead: "Mark Read",
        bulkUnread: "Mark Unread",
        copy: "Copy text",
        copied: "Copied!",
        delete: "Delete message",
        markUnread: "Mark as unread",
        sendTemplate: "Send Template"
      }
    },
    details: {
      title: "Details",
      createOrder: "Create Order",
      recentOrders: "Recent Orders",
      noOrders: "No recent orders",
      expiresIn: "Expires in",
      tags: "Tags",
      addTag: "Add Tag",
      noTags: "No tags assigned",
      block: "Block Contact",
      unblock: "Unblock Contact",
      blockedBadge: "BLOCKED",
      deleteChat: "Delete Conversation"
    },
    orderPanel: {
      title: "Create Order",
      customer: "Customer",
      trainingWarning: "Training Mode: Custom items and price overrides are disabled.",
      approvalWarning: "This order requires supervisor approval.",
      trainingApproval: "Training Mode: Orders require supervisor approval.",
      items: "Items",
      searchCatalog: "Search Catalog",
      customItem: "+ Custom Item",
      searchPlaceholder: "Search products...",
      outOfStock: "Out of Stock",
      inStock: "in stock",
      itemName: "Item Name",
      price: "Price",
      qty: "Qty",
      addItem: "Add Item",
      cartEmpty: "Cart is empty",
      subtotal: "Subtotal",
      vat: "VAT",
      total: "Total",
      submitApproval: "Submit for Approval",
      createLink: "Create & Send Link",
      processing: "Processing...",
      orderSubmittedForApproval: "Order #{orderNumber} submitted for approval.",
      orderLinkMessage: "Your order #{orderNumber} is ready! Complete payment here: {link}"
    }
  },
  orders: {
    title: "Orders Management",
    desc: "Track approvals, payments, and fulfillment.",
    searchPlaceholder: "Search orders, customers...",
    customer: "Customer",
    trainingWarning: "Training Data",
    approvalWarning: "Requires Approval",
    trainingApproval: "Training Approval",
    items: "Items",
    searchCatalog: "Search Catalog",
    customItem: "Custom Item",
    productName: "Product Name",
    price: "Price",
    quantity: "Quantity",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    notes: "Notes",
    submit: "Submit Order",
    creating: "Creating...",
    processing: "Processing...",
    orderSubmittedForApproval: "Order submitted for approval",
    orderLinkMessage: "Order link sent to customer",
    tabs: {
      all: "All",
      pending: "Pending",
      unpaid: "Unpaid",
      paid: "Paid",
      rejected: "Rejected"
    },
    table: {
      orderNum: "Order #",
      customer: "Customer",
      total: "Total",
      status: "Status",
      agent: "Agent",
      date: "Date"
    },
    status: {
      pendingApproval: "Pending Approval",
      rejected: "Rejected",
      paid: "Paid",
      pendingPayment: "Pending Payment",
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled"
    },
    drawer: {
      approvalRequired: "Approval Required",
      approvalDesc: "This order needs supervisor approval before payment link can be generated.",
      openChat: "Open Chat",
      fulfillment: "Fulfillment",
      delivery: "Delivery",
      pickup: "Store Pickup",
      noShipping: "No Shipping",
      branch: "Branch ID / Name",
      itemsPricing: "Items & Pricing",
      discount: "Discount",
      recalculating: "Recalculating...",
      saveChanges: "Save Changes",
      approvalActions: "Approval Actions",
      approve: "Approve Order",
      reject: "Reject",
      rejectReason: "Reason for rejection...",
      confirmReject: "Confirm Rejection",
      auditLog: "Audit Log",
      invoice: "Tax Invoice",
      readyGenerate: "Ready to generate",
      generate: "Generate",
      paymentLink: "Open Payment Link"
    }
  },
  analytics: {
    messaging: "Messaging Analytics",
    notifications: "Notification Analytics",
    bots: "Bot Session Analytics",
    desc: "Deep dive into your performance metrics.",
    days: {
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat"
    },
    cost: {
      total: "Total Cost",
      perMessage: "Avg Cost / Message",
      marketing: "Marketing",
      utility: "Utility",
      authentication: "Authentication",
      service: "Service"
    },
    ranges: {
      d7: "Last 7 Days",
      d30: "Last 30 Days",
      m3: "Last 3 Months"
    },
    metrics: {
      satisfaction: "Customer Satisfaction",
      responseRate: "Feedback Response Rate",
      topAgent: "Top Agent Rating",
      volume: "Message Volume",
      deliveryRate: "Delivery & Read Rates",
      delivered: "Delivered",
      read: "Read",
      failed: "Failed",
      heatmap: "Campaign Performance Heatmap",
      cost: "Cost Analysis",
      sessions: "Total Sessions",
      completion: "Completion Rate",
      topFlows: "Most Triggered Flows"
    }
  },
  settings: {
    title: "Platform Settings",
    desc: "Manage business profile, API keys, and team permissions.",
    tabs: {
      general: "General",
      protection: "Protection",
      workingHours: "Working Hours",
      sla: "SLA Policy",
      whatsapp: "WhatsApp",
      inbox: "Inbox",
      api: "API",
      team: "Team",
      notifications: "Internal Notifications",
      tags: "Tags"
    },
    general: {
      title: "General Settings",
      displayName: "Display Name",
      email: "Email Address"
    },
    workingHours: {
      title: "Business Schedule",
      closed: "Closed",
      responseTitle: "Off-Hours Response",
      autoReply: "Auto-Reply Message",
      helper: "This message will be sent automatically when a customer messages outside of working hours."
    },
    sla: {
      title: "Service Level Agreement (SLA)",
      firstResponse: "First Response Time",
      firstResponseDesc: "Target time for agent to reply to a new customer message.",
      minutes: "Minutes",
      resolution: "Resolution Time",
      resolutionDesc: "Target time to resolve and close a conversation.",
      hours: "Hours"
    },
    protection: {
      emergency: "Emergency Controls",
      stop: "Emergency Stop",
      stopDesc: "Pause ALL outgoing messages instantly.",
      resumeBtn: "RESUME",
      stopBtn: "STOP",
      pausedWarning: "⚠️ System is currently PAUSED. Messages are queuing but not sending.",
      health: "Health & Warmup",
      warmup: "Warm-Up Mode",
      warmupDesc: "Gradually increase message limits safely.",
      limit: "Daily Limit"
    },
    whatsapp: {
      catalog: "Product Catalog",
      enableCatalog: "Enable Catalog",
      metaStatus: "Meta Status",
      approved: "Approved",
      disabled: "Disabled",
      cartDisabled: "Add to Cart is disabled because catalog is OFF",
      tools: "Tools & Danger Zone",
      deregister: "Deregister Number",
      disconnect: "Disconnect",
      verify: "Verify Number",
      sendCode: "Send Code",
      attempts: "Attempts remaining"
    },
    inbox: {
      title: "Inbox Settings",
      readReceipts: "Read Receipts",
      readReceiptsDesc: "When enabled, customers see blue ticks.",
      readReceiptsTip: "Allow customers to see when you've read their messages",
      autoSave: "Auto-Save Contacts",
      autoSaveWarning: "Warning: Contacts won't be saved automatically.",
      autoAssign: "Auto-Assign Chat",
      assignOrder: "Assignment Order",
      roundRobin: "Round Robin (Even Distribution)",
      loadBalanced: "Load Balanced (Active Chats)",
      skillBased: "Skill Based (Tags)"
    },
    api: {
      token: "Access Token",
      saveToken: "Save Token",
      webhook: "Webhook URL",
      testWebhook: "Test Webhook",
      verified: "Verified",
      test: "Test",
      success: "Webhook verified successfully!",
      invalidToken: "Invalid token format. Must start with EA..."
    },
    team: {
      title: "Team Members",
      add: "Add Member",
      createUser: "Create User",
      table: {
        user: "User",
        role: "Role",
        status: "Status"
      },
      user: "User",
      role: "Role",
      status: "Status",
      edit: "Edit User",
      create: "Add User",
      name: "Name",
      email: "Email",
      agentMode: "Agent Mode",
      modes: {
        training: "Training",
        standard: "Standard",
        senior: "Senior"
      },
      roles: {
        admin: "Admin",
        agent: "Agent",
        supervisor: "Supervisor",
        viewer: "Viewer"
      },
      logoutWarning: "Changing your own role will log you out."
    },
    notifications: {
      title: "Send Internal Announcement",
      desc: "Broadcast alerts and messages to your team members.",
      form: {
        title: "Title",
        message: "Message",
        type: "Type",
        priority: "Priority",
        target: "Target Audience",
        link: "Link (Optional)",
        send: "Send Notification"
      },
      types: {
        announcement: "Announcement",
        operational: "Operational",
        system: "System Alert"
      },
      priorities: {
        normal: "Normal",
        important: "Important",
        critical: "Critical"
      },
      history: "Sent History",
      noHistory: "No announcements sent yet."
    },
    tags: {
      title: "Conversation Tags",
      placeholder: "e.g., VIP, Support, Lead",
      create: "Create Tag",
      noTags: "No tags created yet."
    }
  },
  automation: {
    autoReplies: {
      title: "Auto Replies",
      desc: "Configure automated welcome messages, away messages, and keyword triggers.",
      sections: {
        events: "Events (Welcome / Away)",
        keywords: "Keyword Triggers"
      },
      fields: {
        trigger: "Trigger",
        content: "Message Content"
      },
      events: "Events (Welcome / Away)",
      keywords: "Keyword Triggers",
      create: "Create Rule",
      edit: "Edit Rule",
      trigger: "Trigger",
      content: "Message Content",
      priority: "Priority",
      matchType: "Match Type",
      contains: "Contains",
      exact: "Exact Match",
      noKeywords: "No keyword rules defined."
    },
    chatbot: {
      title: "Chatbot Builder",
      desc: "Advanced multi-bot flow builder.",
      newBot: "New Bot",
      newChatbot: "New Chatbot",
      option1: "Option 1",
      editSettings: "Edit Bot Settings",
      createBot: "Create New Bot",
      botName: "Bot Name",
      language: "Language",
      toolbox: "Toolbox",
      properties: "Node Properties",
      label: "Label",
      textMessage: "Text Message",
      mediaConfig: "Media Config",
      buttons: "Buttons",
      actionType: "Action Type",
      save: "Save",
      empty: "Empty",
      nodes: {
        message: "Send Message",
        question: "Ask Question",
        action: "Perform Action",
        media: "Send Media",
        list: "Send List"
      }
    },
    knowledgeBase: {
      title: "Knowledge Base",
      desc: "Train your AI agents with company documents and FAQs.",
      create: "Add Article",
      edit: "Edit Article",
      new: "New Article",
      editArticle: "Edit Article",
      newArticle: "New Article",
      category: "Category",
      question: "Question",
      answer: "Answer",
      tags: "Tags",
      table: {
        category: "Category",
        question: "Question",
        answer: "Answer"
      },
      placeholders: {
        category: "e.g. Account",
        question: "e.g. How to reset password?",
        answer: "Answer text..."
      }
    }
  },
  notificationsPage: {
    title: "Broadcast Campaigns",
    desc: "Create and manage bulk WhatsApp notifications.",
    create: "New Campaign",
    status: {
      DRAFT: "Draft",
      RUNNING: "Running",
      PAUSED: "Paused",
      COMPLETED: "Completed"
    },
    table: {
      title: "Title",
      status: "Status",
      progress: "Progress",
      created: "Created"
    },
    wizard: {
      steps: {
        basic: "Basic Info",
        template: "Template",
        recipients: "Recipients",
        advanced: "Advanced"
      },
      actions: {
        back: "Back",
        next: "Next",
        saveDraft: "Save Draft",
        saveSend: "Launch Campaign"
      },
      basic: {
        labelTitle: "Campaign Title",
        placeholderTitle: "e.g. Summer Sale",
        labelType: "Campaign Type",
        types: {
          broadcast: "Broadcast",
          transactional: "Transactional"
        }
      },
      template: {
        select: "Select Template",
        preview: "Message Preview"
      },
      recipients: {
        label: "Select Contact List",
        smartSegments: "Smart Segments",
        comingSoon: "Coming Soon"
      },
      advanced: {
        retry: "Retry Failed Messages",
        emailReport: "Email Delivery Report",
        throttling: "Throttling"
      }
    }
  },
  contacts: {
    title: "Contact Management",
    desc: "Manage your audience, lists, and segments.",
    add: "Add Contact",
    createList: "Create List",
    createTag: "Create Tag",
    createSegment: "Create Segment",
    import: "Import CSV",
    export: "Export CSV",
    status: {
      SUBSCRIBED: "Subscribed",
      UNSUBSCRIBED: "Unsubscribed"
    },
    table: {
      name: "Name",
      status: "Status",
      tags: "Tags",
      lists: "Lists",
      created: "Added Date"
    },
    modal: {
      personal: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "WhatsApp Number",
      email: "Email Address",
      segmentation: "Segmentation",
      attributes: "Custom Attributes",
      addAttr: "Add Attribute",
      key: "Key",
      value: "Value"
    },
    lists: {
      title: "Contact Lists",
      desc: "Organize contacts into static lists.",
      create: "Create List",
      default: "Default",
      count: "Contacts",
      name: "List Name"
    },
    tags: {
      title: "Tags",
      desc: "Categorize contacts for easy filtering.",
      create: "Create Tag",
      name: "Tag Name",
      color: "Color"
    },
    segments: {
      title: "Smart Segments",
      desc: "Dynamic lists based on rules."
    },
    importPage: {
      title: "Import & Export",
      desc: "Bulk upload contacts via CSV or export your data.",
      upload: "Upload CSV File",
      history: "Import History",
      processing: "Processing..."
    }
  },
  internalNotifications: {
    title: "Internal Notifications",
    empty: "No new notifications",
    markAllRead: "Mark all as read",
    viewAll: "View all notifications"
  },
  templates: {
    title: "Message Templates",
    desc: "Manage WhatsApp message templates.",
    create: "Create Template",
    status: {
      APPROVED: "Approved",
      PENDING: "Pending",
      REJECTED: "Rejected",
      DRAFT: "Draft",
      PAUSED: "Paused"
    },
    table: {
      name: "Name",
      category: "Category",
      language: "Language",
      status: "Status",
      lastUpdated: "Last Updated"
    },
    drawer: {
      details: "Template Details",
      rejectionReason: "Rejection Reason",
      preview: "Preview",
      variables: "Variables",
      variablePrefix: "Variable",
      noVariables: "No variables detected"
    },
    createModal: {
      title: "Create New Template",
      name: "Template Name",
      category: "Category",
      language: "Language",
      header: "Header (Optional)",
      headerTypes: {
        NONE: "None",
        TEXT: "Text",
        MEDIA: "Media"
      },
      body: "Message Body",
      bodyPlaceholder: "Hello {{1}}, your order {{2}} is ready.",
      footer: "Footer (Optional)",
      buttons: "Buttons (Optional)",
      addButton: "Add Button",
      buttonTypes: {
        QUICK_REPLY: "Quick Reply",
        URL: "Visit Website",
        PHONE_NUMBER: "Call Phone",
        COPY_CODE: "Copy Code"
      },
      cancel: "Cancel",
      submit: "Submit for Review",
      success: "Template created successfully!",
      error: "Failed to create template. Name might be duplicate.",
      validation: {
        required: "All fields are required"
      }
    },
    sync: {
      button: "Sync Meta Status",
      syncing: "Syncing...",
      success: "Synced successfully",
      failed: "Sync failed",
      lastSync: "Last synced:"
    },
    deleteModal: {
      title: "Delete Template",
      message: "Are you sure you want to delete this template? This action cannot be undone.",
      confirm: "Delete",
      cancel: "Cancel"
    },
    noTemplates: "No templates found.",
    workingBadge: "Meta Sync Active",
    allStatus: "All Status"
  },
  flows: {
    title: "Flows",
    desc: "Manage interactive flows."
  },
  quickReplies: {
    title: "Quick Replies",
    desc: "Manage canned responses.",
    create: "Create Reply",
    noReplies: "No quick replies found."
  }
};
