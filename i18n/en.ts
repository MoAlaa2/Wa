

export const en = {
  common: {
    dashboard: "Dashboard",
    inbox: "Inbox",
    contentLibrary: "Content Library",
    automation: "Automation",
    settings: "Settings",
    notifications: "Notifications",
    contacts: "Contacts",
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
    madeWithLove: "Made with ❤️ by Mohamed Alaa"
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
    importExport: "Import / Export"
  },
  internalNotifications: {
    title: "Internal Notifications",
    empty: "No new notifications",
    markAllRead: "Mark all as read",
    viewAll: "View all notifications",
    types: {
      SYSTEM: "System Alert",
      OPERATIONAL: "Operation",
      ADMIN: "Admin",
      CUSTOM: "Announcement"
    },
    adminPanel: {
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
      targets: {
        all: "All Users",
        admins: "Admins Only",
        agents: "Agents Only"
      },
      history: "Sent History"
    }
  },
  dashboard: {
    title: "Executive Dashboard",
    desc: "Real-time overview of your WhatsApp Enterprise performance.",
    export: "Export Report",
    lastUpdated: "Last updated: Just now",
    stats: {
      totalMessages: "Total Messages",
      activeConversations: "Active Conversations",
      templateStatus: "Template Status",
      pendingResponses: "Pending Responses",
      deliveredRate: "Delivered Rate",
      readRate: "Read Rate",
      failedRate: "Failed Rate",
      totalCost: "Total Cost",
      avgReadTime: "Avg. Read Time",
      costPerMsg: "Cost / Msg"
    },
    trends: {
      increase: "increase",
      decrease: "decrease",
      newToday: "+5 new today",
      approvedRate: "Approved rate",
      attention: "Requires attention"
    },
    systemStatus: "System Status: Backend Connected",
    sections: {
      performance: "Message Performance",
      cost: "Cost Analysis",
      failures: "Failure Intelligence",
      heatmap: "Campaign Heatmap",
      agents: "Agent Performance"
    },
    charts: {
      sent: "Sent",
      delivered: "Delivered",
      read: "Read",
      failed: "Failed"
    },
    table: {
      errorType: "Error Type",
      impact: "Impact",
      count: "Count",
      recommendation: "Fix Recommendation",
      agent: "Agent",
      chats: "Chats Handled",
      responseTime: "Avg Response",
      resolution: "Resolution %",
      action: "Action"
    },
    actions: {
      retry: "Retry",
      fix: "Fix",
      exclude: "Exclude"
    }
  },
  contacts: {
    title: "Contact Management",
    desc: "Manage your audience, lists, and segments.",
    addContact: "Add Contact",
    createList: "Create List",
    createTag: "Create Tag",
    createSegment: "Create Segment",
    import: "Import CSV",
    export: "Export CSV",
    table: {
      name: "Name",
      phone: "Phone",
      status: "Status",
      tags: "Tags",
      created: "Added Date",
      lists: "Lists"
    },
    status: {
      SUBSCRIBED: "Subscribed",
      UNSUBSCRIBED: "Unsubscribed"
    },
    modal: {
      title: "Contact Details",
      personalInfo: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "WhatsApp Number",
      email: "Email Address",
      organization: "Organization",
      customAttributes: "Custom Attributes",
      addAttr: "Add Attribute",
      key: "Key",
      value: "Value"
    },
    lists: {
      title: "Contact Lists",
      desc: "Organize contacts into static lists for broadcasting.",
      name: "List Name",
      count: "Contacts",
      default: "Default"
    },
    tags: {
      title: "Tags",
      desc: "Categorize contacts for easy filtering and targeting.",
      name: "Tag Name",
      color: "Color"
    },
    segments: {
      title: "Smart Segments",
      desc: "Dynamic lists based on contact attributes and behavior.",
      rules: "Segmentation Rules"
    },
    importPage: {
      title: "Import & Export",
      desc: "Bulk upload contacts via CSV or export your data.",
      upload: "Upload CSV File",
      history: "Import History",
      processing: "Processing...",
      completed: "Completed",
      failed: "Failed"
    }
  },
  notifications: {
    title: "Broadcast Campaigns",
    desc: "Create and manage bulk WhatsApp notifications and marketing campaigns.",
    create: "New Campaign",
    status: {
      DRAFT: "Draft",
      RUNNING: "Sending",
      PAUSED: "Paused",
      COMPLETED: "Completed"
    },
    table: {
      title: "Campaign Title",
      status: "Status",
      progress: "Progress",
      sent: "Sent",
      delivered: "Delivered",
      read: "Read",
      failed: "Failed",
      created: "Created At"
    },
    wizard: {
      steps: {
        basic: "Basic Info",
        template: "Template",
        recipients: "Recipients",
        advanced: "Advanced"
      },
      basic: {
        labelTitle: "Campaign Title",
        placeholderTitle: "Ex: Summer Sale Announcement",
        labelType: "Campaign Type",
        types: {
          broadcast: "Broadcast",
          transactional: "Transactional / API"
        }
      },
      template: {
        select: "Select Template",
        preview: "Message Preview"
      },
      recipients: {
        selectList: "Select Contact List",
        smartSegments: "Smart Segments",
        comingSoon: "Coming Soon"
      },
      advanced: {
        retry: "Retry Failed Messages",
        throttling: "Throttling (Messages per minute)",
        emailReport: "Email Delivery Report"
      },
      actions: {
        saveDraft: "Save Draft",
        saveSend: "Launch Campaign",
        next: "Next Step",
        back: "Back"
      }
    }
  },
  pages: {
    inbox: {
      title: "Unified Inbox",
      desc: "Manage all your customer conversations in one place with multi-agent support.",
      searchPlaceholder: "Search contacts...",
      noSelection: "Select a conversation to start messaging",
      typeMessage: "Type a message...",
      recording: "Recording...",
      privateNote: "Internal Note",
      privateNotePlaceholder: "Add a private note for the team...",
      assignAgent: "Assign Agent",
      agentAssigned: "Agent Assigned",
      unassigned: "Unassigned",
      tabs: {
        all: "All",
        mine: "Mine",
        unread: "Unread"
      },
      messageActions: {
        copy: "Copy text",
        delete: "Delete message",
        markUnread: "Mark as unread",
        copied: "Copied!",
        sendTemplate: "Send Template (Mock)",
        clearConversation: "Clear Conversation"
      },
      bulkActions: {
        selected: "Selected",
        markRead: "Mark Read",
        markUnread: "Mark Unread",
        clear: "Delete"
      },
      details: {
        title: "Details",
        about: "About Contact",
        windowOpen: "24h Window Active",
        windowClosed: "24h Window Closed",
        expiresIn: "Expires in",
        created: "Created",
        block: "Block Contact",
        unblock: "Unblock Contact",
        blockedBadge: "BLOCKED",
        deleteChat: "Delete Conversation",
        tags: "Tags",
        addTag: "Add Tag",
        noTags: "No tags assigned"
      },
      filterByTag: "Filter by Tag"
    },
    templates: {
      title: "Message Templates",
      desc: "Create, manage, and submit WhatsApp message templates for approval.",
      create: "Create Template",
      workingBadge: "TEMPLATES WORKING",
      allStatus: "All Status",
      noTemplates: "No templates found matching your criteria.",
      table: {
        name: "Name",
        category: "Category",
        language: "Language",
        status: "Status",
        lastUpdated: "Last Updated"
      },
      status: {
        APPROVED: "Approved",
        PENDING: "Pending",
        REJECTED: "Rejected",
        DRAFT: "Draft",
        PAUSED: "Paused"
      },
      drawer: {
        details: "Template Details",
        preview: "Message Preview",
        history: "History",
        variables: "Variables",
        rejectionReason: "Rejection Reason",
        bodyText: "Body Text",
        header: "Header",
        footer: "Footer",
        buttons: "Buttons",
        variablePrefix: "Variable",
        noVariables: "No variables detected"
      }
    },
    flows: {
      title: "Interactive Flows",
      desc: "Build structured interaction flows for better customer data collection."
    },
    quickReplies: {
      title: "Quick Replies",
      desc: "Manage canned responses for faster agent replies."
    },
    autoReplies: {
      title: "Auto Replies",
      desc: "Configure automated welcome messages, away messages, and keyword triggers.",
      create: "Create Rule",
      activeTime: "Active",
      noKeywords: "No keyword rules defined.",
      sections: {
        events: "Events (Welcome / Away)",
        keywords: "Keyword Triggers"
      },
      fields: {
        trigger: "Trigger",
        content: "Response Message",
        schedule: "Schedule"
      }
    },
    chatbot: {
      title: "Chatbot Builder",
      desc: "Visual drag-and-drop builder for automated conversational agents.",
      toolbox: "Toolbox",
      canvasPreview: "Canvas View (Read-only Preview)",
      properties: "Node Properties",
      labels: {
        label: "Label",
        content: "Content",
        options: "Options (comma separated)"
      },
      placeholders: {
        enterMessage: "Enter message text...",
        enterOptions: "Yes, No, Maybe"
      },
      nodes: {
        message: "Send Message",
        question: "Ask Question",
        action: "Perform Action"
      },
      canvas: {
        start: "Start",
        dragText: "Drag nodes here to build your flow"
      }
    },
    knowledgeBase: {
      title: "Knowledge Base",
      desc: "Train your AI agents with company documents and FAQs.",
      create: "Add Article",
      editArticle: "Edit Article",
      newArticle: "New Article",
      placeholders: {
        category: "e.g., Billing",
        question: "How do I...?",
        answer: "The answer is..."
      },
      table: {
        question: "Question",
        answer: "Answer",
        category: "Category",
        tags: "Tags",
        lastUpdated: "Last Updated"
      }
    },
    settings: {
      title: "Platform Settings",
      desc: "Manage business profile, API keys, and team permissions.",
      tabs: {
        general: "General",
        whatsapp: "WhatsApp",
        inbox: "Inbox",
        api: "API",
        tags: "Tags",
        team: "Team",
        notifications: "Internal Notifications"
      },
      tags: {
        title: "Conversation Tags",
        desc: "Manage tags used to categorize conversations.",
        create: "Create Tag",
        name: "Tag Name",
        color: "Color",
        placeholder: "e.g., VIP, Support, Lead",
        noTags: "No tags created yet."
      },
      team: {
        title: "Team Members",
        desc: "Manage user access and roles.",
        createUser: "Add Member",
        table: {
          user: "User",
          role: "Role",
          status: "Status"
        },
        logoutWarning: "Changing your own role will log you out."
      },
      whatsapp: {
        catalog: {
          title: "Product Catalog",
          enable: "Enable Catalog",
          status: "Meta Status",
          approved: "Approved",
          cartDisabled: "Add to Cart is disabled because catalog is OFF",
          confirmTitle: "Enable Product Catalog?",
          confirmDesc: "This will sync your products with Meta."
        },
        tools: {
          title: "Tools & Danger Zone",
          deregister: "Deregister Number",
          deregisterWarning: "Cannot deregister an active number.",
          verify: "Verify Number",
          attempts: "Attempts remaining"
        }
      },
      inbox: {
        title: "Inbox Settings",
        readReceipts: "Read Receipts",
        readReceiptsTip: "When enabled, customers see blue ticks.",
        autoSave: "Auto-Save Contacts",
        autoSaveWarning: "Warning: Contacts won't be saved automatically.",
        autoAssign: "Auto-Assign Chat",
        assignOrder: "Assignment Order",
        noAgents: "No eligible agents found for auto-assign."
      },
      api: {
        title: "API Configuration",
        token: "Access Token",
        webhook: "Webhook URL",
        test: "Test Webhook",
        success: "Webhook test successful!",
        invalidToken: "Invalid token format. Must start with EA..."
      }
    }
  }
};