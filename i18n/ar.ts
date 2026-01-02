
export const ar = {
  common: {
    dashboard: "لوحة التحكم",
    inbox: "صندوق الوارد",
    contentLibrary: "مكتبة المحتوى",
    automation: "الأتمتة",
    settings: "الإعدادات",
    notifications: "الإشعارات",
    contacts: "جهات الاتصال",
    logout: "تسجيل الخروج",
    welcome: "مرحباً بك",
    arabicEnabled: "اللغة العربية مفعلة",
    switchLanguage: "التبديل للإنجليزية",
    loading: "جاري التحميل...",
    permissionsDebug: "تحكم الصلاحيات (للمشرفين فقط)",
    actions: "إجراءات",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    search: "بحث...",
    filter: "تصفية",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذا العنصر؟",
    noData: "لا توجد بيانات",
    all: "الكل",
    image: "صورة",
    madeWithLove: "صنع بكل حب ❤️ بواسطة محمد علاء"
  },
  auth: {
    loginTitle: "تسجيل الدخول - القثمي واتساب",
    emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    loginButton: "دخول",
    forgotPassword: "نسيت كلمة المرور؟",
    error: "بيانات الدخول غير صحيحة"
  },
  nav: {
    templates: "القوالب",
    flows: "التدفقات",
    quickReplies: "الردود السريعة",
    autoReplies: "الردود التلقائية",
    chatbot: "بناء الشات بوت",
    knowledgeBase: "قاعدة المعرفة",
    campaigns: "الحملات",
    allContacts: "كل جهات الاتصال",
    lists: "القوائم",
    tags: "الوسوم",
    segments: "شرائح ذكية",
    importExport: "استيراد / تصدير"
  },
  internalNotifications: {
    title: "الإشعارات الداخلية",
    empty: "لا توجد إشعارات جديدة",
    markAllRead: "تحديد الكل كمقروء",
    viewAll: "عرض كل الإشعارات",
    types: {
      SYSTEM: "تنبيه نظام",
      OPERATIONAL: "عمليات",
      ADMIN: "إداري",
      CUSTOM: "إعلان"
    },
    adminPanel: {
      title: "إرسال إعلان داخلي",
      desc: "بث التنبيهات والرسائل لأعضاء فريقك.",
      form: {
        title: "العنوان",
        message: "الرسالة",
        type: "النوع",
        priority: "الأولوية",
        target: "الجمهور المستهدف",
        link: "رابط (اختياري)",
        send: "إرسال الإشعار"
      },
      targets: {
        all: "جميع المستخدمين",
        admins: "المشرفين فقط",
        agents: "الوكلاء فقط"
      },
      history: "سجل الإرسال"
    }
  },
  dashboard: {
    title: "لوحة القيادة التنفيذية",
    desc: "نظرة عامة فورية على أداء واتساب للمؤسسة.",
    export: "تصدير التقرير",
    lastUpdated: "آخر تحديث: الآن",
    stats: {
      totalMessages: "إجمالي الرسائل",
      activeConversations: "المحادثات النشطة",
      templateStatus: "حالة القوالب",
      pendingResponses: "ردود معلقة",
      deliveredRate: "نسبة التسليم",
      readRate: "نسبة القراءة",
      failedRate: "نسبة الفشل",
      totalCost: "التكلفة الكلية",
      avgReadTime: "متوسط وقت القراءة",
      costPerMsg: "تكلفة الرسالة"
    },
    trends: {
      increase: "زيادة",
      decrease: "نقصان",
      newToday: "+5 جديدة اليوم",
      approvedRate: "نسبة القبول",
      attention: "تتطلب انتباهاً"
    },
    systemStatus: "حالة النظام: متصل بالخادم",
    sections: {
      performance: "أداء الرسائل",
      cost: "تحليل التكلفة",
      failures: "ذكاء الأخطاء",
      heatmap: "خريطة الحملات",
      agents: "أداء الوكلاء"
    },
    charts: {
      sent: "أرسلت",
      delivered: "سلمت",
      read: "قرئت",
      failed: "فشلت"
    },
    table: {
      errorType: "نوع الخطأ",
      impact: "التأثير",
      count: "العدد",
      recommendation: "الإصلاح المقترح",
      agent: "الوكيل",
      chats: "المحادثات",
      responseTime: "متوسط الرد",
      resolution: "الحل %",
      action: "إجراء"
    },
    actions: {
      retry: "إعادة",
      fix: "إصلاح",
      exclude: "استبعاد"
    }
  },
  contacts: {
    title: "إدارة جهات الاتصال",
    desc: "إدارة جمهورك، القوائم، والشرائح.",
    addContact: "إضافة جهة اتصال",
    createList: "إنشاء قائمة",
    createTag: "إنشاء وسم",
    createSegment: "إنشاء شريحة",
    import: "استيراد CSV",
    export: "تصدير CSV",
    table: {
      name: "الاسم",
      phone: "الهاتف",
      status: "الحالة",
      tags: "الوسوم",
      created: "تاريخ الإضافة",
      lists: "القوائم"
    },
    status: {
      SUBSCRIBED: "مشترك",
      UNSUBSCRIBED: "ملغى الاشتراك"
    },
    modal: {
      title: "تفاصيل جهة الاتصال",
      personalInfo: "المعلومات الشخصية",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      phone: "رقم واتساب",
      email: "البريد الإلكتروني",
      organization: "المؤسسة",
      customAttributes: "خصائص مخصصة",
      addAttr: "إضافة خاصية",
      key: "المفتاح",
      value: "القيمة"
    },
    lists: {
      title: "قوائم الاتصال",
      desc: "نظم جهات الاتصال في قوائم ثابتة للبث.",
      name: "اسم القائمة",
      count: "جهات الاتصال",
      default: "الافتراضية"
    },
    tags: {
      title: "الوسوم",
      desc: "صنف جهات الاتصال لسهولة التصفية والاستهداف.",
      name: "اسم الوسم",
      color: "اللون"
    },
    segments: {
      title: "الشرائح الذكية",
      desc: "قوائم ديناميكية بناءً على خصائص وسلوك جهات الاتصال.",
      rules: "قواعد التقسيم"
    },
    importPage: {
      title: "استيراد وتصدير",
      desc: "رفع جهات الاتصال بالجملة عبر CSV أو تصدير بياناتك.",
      upload: "رفع ملف CSV",
      history: "سجل الاستيراد",
      processing: "جاري المعالجة...",
      completed: "مكتمل",
      failed: "فشل"
    }
  },
  notifications: {
    title: "حملات البث",
    desc: "إنشاء وإدارة إشعارات واتساب الجماعية وحملات التسويق.",
    create: "حملة جديدة",
    status: {
      DRAFT: "مسودة",
      RUNNING: "جاري الإرسال",
      PAUSED: "متوقف",
      COMPLETED: "مكتمل"
    },
    table: {
      title: "عنوان الحملة",
      status: "الحالة",
      progress: "التقدم",
      sent: "تم الإرسال",
      delivered: "تم التسليم",
      read: "تمت القراءة",
      failed: "فشل",
      created: "تاريخ الإنشاء"
    },
    wizard: {
      steps: {
        basic: "المعلومات الأساسية",
        template: "القالب",
        recipients: "المستلمين",
        advanced: "خيارات متقدمة"
      },
      basic: {
        labelTitle: "عنوان الحملة",
        placeholderTitle: "مثال: إعلان عروض الصيف",
        labelType: "نوع الحملة",
        types: {
          broadcast: "بث جماعي",
          transactional: "معاملات / API"
        }
      },
      template: {
        select: "اختر القالب",
        preview: "معاينة الرسالة"
      },
      recipients: {
        selectList: "اختر قائمة جهات الاتصال",
        smartSegments: "شرائح ذكية",
        comingSoon: "قريباً"
      },
      advanced: {
        retry: "إعادة محاولة الرسائل الفاشلة",
        throttling: "التقييد (رسائل في الدقيقة)",
        emailReport: "تقرير التسليم عبر البريد"
      },
      actions: {
        saveDraft: "حفظ كمسودة",
        saveSend: "إطلاق الحملة",
        next: "الخطوة التالية",
        back: "رجوع"
      }
    }
  },
  pages: {
    inbox: {
      title: "صندوق الوارد الموحد",
      desc: "إدارة جميع محادثات العملاء في مكان واحد مع دعم تعدد الوكلاء.",
      searchPlaceholder: "بحث عن جهات الاتصال...",
      noSelection: "اختر محادثة للبدء",
      typeMessage: "اكتب رسالة...",
      recording: "جاري التسجيل...",
      privateNote: "ملاحظة داخلية",
      privateNotePlaceholder: "أضف ملاحظة خاصة للفريق...",
      assignAgent: "تعيين وكيل",
      agentAssigned: "تم تعيين الوكيل",
      unassigned: "غير معين",
      tabs: {
        all: "الكل",
        mine: "الخاصة بي",
        unread: "غير مقروءة"
      },
      messageActions: {
        copy: "نسخ النص",
        delete: "حذف الرسالة",
        markUnread: "تعيين كغير مقروء",
        copied: "تم النسخ!",
        sendTemplate: "إرسال قالب (تجريبي)",
        clearConversation: "مسح المحادثة"
      },
      bulkActions: {
        selected: "تم تحديد",
        markRead: "قراءة الكل",
        markUnread: "غير مقروء",
        clear: "حذف"
      },
      details: {
        title: "التفاصيل",
        about: "عن جهة الاتصال",
        windowOpen: "نافذة 24 ساعة نشطة",
        windowClosed: "نافذة 24 ساعة مغلقة",
        expiresIn: "ينتهي خلال",
        created: "تاريخ الإنشاء",
        block: "حظر جهة الاتصال",
        unblock: "إلغاء الحظر",
        blockedBadge: "محظور",
        deleteChat: "حذف المحادثة",
        tags: "الوسوم",
        addTag: "إضافة وسم",
        noTags: "لا توجد وسوم"
      },
      filterByTag: "تصفية حسب الوسم"
    },
    templates: {
      title: "قوالب الرسائل",
      desc: "إنشاء وإدارة وإرسال قوالب رسائل واتساب للموافقة عليها.",
      create: "إنشاء قالب",
      workingBadge: "القوالب تعمل",
      allStatus: "كل الحالات",
      noTemplates: "لم يتم العثور على قوالب تطابق معايير البحث.",
      table: {
        name: "الاسم",
        category: "الفئة",
        language: "اللغة",
        status: "الحالة",
        lastUpdated: "آخر تحديث"
      },
      status: {
        APPROVED: "معتمد",
        PENDING: "قيد المراجعة",
        REJECTED: "مرفوض",
        DRAFT: "مسودة",
        PAUSED: "متوقف"
      },
      drawer: {
        details: "تفاصيل القالب",
        preview: "معاينة الرسالة",
        history: "السجل",
        variables: "المتغيرات",
        rejectionReason: "سبب الرفض",
        bodyText: "نص الرسالة",
        header: "الرأس",
        footer: "التذييل",
        buttons: "الأزرار",
        variablePrefix: "متغير",
        noVariables: "لم يتم اكتشاف متغيرات"
      }
    },
    flows: {
      title: "تدفقات تفاعلية",
      desc: "بناء تدفقات تفاعل منظمة لجمع بيانات العملاء بشكل أفضل."
    },
    quickReplies: {
      title: "الردود السريعة",
      desc: "إدارة الردود الجاهزة لسرعة استجابة الوكلاء."
    },
    autoReplies: {
      title: "الردود التلقائية",
      desc: "تكوين رسائل الترحيب التلقائية، ورسائل عدم التواجد، ومحفزات الكلمات المفتاحية.",
      create: "إنشاء قاعدة",
      activeTime: "نشط",
      noKeywords: "لا توجد قواعد للكلمات المفتاحية.",
      sections: {
        events: "الأحداث (ترحيب / عدم تواجد)",
        keywords: "محفزات الكلمات المفتاحية"
      },
      fields: {
        trigger: "المحفز",
        content: "رسالة الرد",
        schedule: "الجدول الزمني"
      }
    },
    chatbot: {
      title: "بناء الشات بوت",
      desc: "منشئ مرئي (سحب وإفلات) للوكلاء الآليين للمحادثة.",
      toolbox: "صندوق الأدوات",
      canvasPreview: "عرض اللوحة (معاينة للقراءة فقط)",
      properties: "خصائص العقدة",
      labels: {
        label: "التسمية",
        content: "المحتوى",
        options: "الخيارات (مفصولة بفواصل)"
      },
      placeholders: {
        enterMessage: "أدخل نص الرسالة...",
        enterOptions: "نعم، لا، ربما"
      },
      nodes: {
        message: "إرسال رسالة",
        question: "طرح سؤال",
        action: "تنفيذ إجراء"
      },
      canvas: {
        start: "البداية",
        dragText: "اسحب العناصر هنا لبناء التدفق"
      }
    },
    knowledgeBase: {
      title: "قاعدة المعرفة",
      desc: "تدريب وكلاء الذكاء الاصطناعي الخاصين بك باستخدام وثائق الشركة والأسئلة الشائعة.",
      create: "إضافة مقال",
      editArticle: "تعديل المقال",
      newArticle: "مقال جديد",
      placeholders: {
        category: "مثال: الفوترة",
        question: "كيف يمكنني...؟",
        answer: "الإجابة هي..."
      },
      table: {
        question: "السؤال",
        answer: "الإجابة",
        category: "الفئة",
        tags: "الوسوم",
        lastUpdated: "آخر تحديث"
      }
    },
    settings: {
      title: "إعدادات المنصة",
      desc: "إدارة ملف العمل التجاري، ومفاتيح API، وصلاحيات الفريق.",
      tabs: {
        general: "عام",
        whatsapp: "واتساب",
        inbox: "صندوق الوارد",
        api: "API",
        tags: "إدارة الوسوم",
        team: "إدارة الفريق",
        notifications: "الإشعارات الداخلية"
      },
      tags: {
        title: "وسوم المحادثات",
        desc: "إدارة الوسوم المستخدمة لتصنيف المحادثات.",
        create: "إنشاء وسم",
        name: "اسم الوسم",
        color: "اللون",
        placeholder: "مثال: هام، دعم فني، مبيعات",
        noTags: "لا توجد وسوم بعد."
      },
      team: {
        title: "أعضاء الفريق",
        desc: "إدارة وصول المستخدمين والأدوار.",
        createUser: "إضافة عضو",
        table: {
          user: "المستخدم",
          role: "الدور",
          status: "الحالة"
        },
        logoutWarning: "تغيير دورك سيؤدي إلى تسجيل الخروج."
      },
      whatsapp: {
        catalog: {
          title: "كتالوج المنتجات",
          enable: "تفعيل الكتالوج",
          status: "حالة Meta",
          approved: "معتمد",
          cartDisabled: "إضافة إلى السلة معطل لأن الكتالوج متوقف",
          confirmTitle: "تفعيل كتالوج المنتجات؟",
          confirmDesc: "سيقوم هذا بمزامنة منتجاتك مع Meta."
        },
        tools: {
          title: "أدوات ومنطقة الخطر",
          deregister: "إلغاء تسجيل الرقم",
          deregisterWarning: "لا يمكن إلغاء تسجيل رقم نشط.",
          verify: "التحقق من الرقم",
          attempts: "المحاولات المتبقية"
        }
      },
      inbox: {
        title: "إعدادات صندوق الوارد",
        readReceipts: "مؤشرات القراءة",
        readReceiptsTip: "عند التفعيل، سيرى العملاء العلامات الزرقاء.",
        autoSave: "حفظ جهات الاتصال تلقائياً",
        autoSaveWarning: "تنبيه: لن يتم حفظ جهات الاتصال تلقائياً.",
        autoAssign: "تعيين المحادثات تلقائياً",
        assignOrder: "ترتيب التعيين",
        noAgents: "لم يتم العثور على وكلاء مؤهلين للتعيين التلقائي."
      },
      api: {
        title: "تكوين API",
        token: "رمز الوصول (Access Token)",
        webhook: "رابط Webhook",
        test: "اختبار Webhook",
        success: "نجح اختبار Webhook!",
        invalidToken: "تنسيق الرمز غير صحيح. يجب أن يبدأ بـ EA..."
      }
    }
  }
};
