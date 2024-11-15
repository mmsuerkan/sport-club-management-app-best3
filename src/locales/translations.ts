export const translations = {
  en: {
    auth: {
      welcome: 'Welcome Back',
      signIn: 'Sign in to manage your club',
      email: 'Email Address',
      password: 'Password',
      loginButton: 'Sign In',
      loggingIn: 'Signing in...'
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your club activities',
      totalStudents: 'Total Students',
      totalGroups: 'Total Groups',
      totalTrainers: 'Total Trainers',
      recentActivity: 'Recent Activity',
      upcomingClasses: 'Upcoming Classes',
      noActivity: 'No recent activity',
      noClasses: 'No upcoming classes'
    },
    branches: {
      title: 'Branches',
      subtitle: 'Manage your club branches',
      addBranch: 'Add Branch',
      branchName: 'Branch Name',
      branchAddress: 'Branch Address',
      cancel: 'Cancel',
      update: 'Update',
      confirmDelete: 'Are you sure you want to delete this branch?',
      noBranches: 'No branches added yet',
      addFirstBranch: 'Add your first branch',
      success: {
        add: 'Branch added successfully',
        update: 'Branch updated successfully',
        delete: 'Branch deleted successfully'
      },
      error: {
        add: 'Failed to add branch',
        update: 'Failed to update branch',
        delete: 'Failed to delete branch'
      }
    },
    groups: {
      title: 'Groups',
      subtitle: 'Manage training groups',
      addGroup: 'Add Group',
      groupName: 'Group Name',
      description: 'Description',
      capacity: 'Capacity',
      ageGroup: 'Age Group',
      ageGroupPlaceholder: 'e.g., 8-10',
      schedule: 'Schedule',
      schedulePlaceholder: 'e.g., Mon, Wed 16:00-17:30',
      cancel: 'Cancel',
      update: 'Update',
      confirmDelete: 'Are you sure you want to delete this group?',
      noBranches: 'You need to create a branch first before adding groups',
      noGroups: 'No groups added yet',
      addFirstGroup: 'Add your first group',
      students: 'Students',
      trainers: 'Trainers',
      success: {
        add: 'Group added successfully',
        update: 'Group updated successfully',
        delete: 'Group deleted successfully'
      },
      error: {
        add: 'Failed to add group',
        update: 'Failed to update group',
        delete: 'Failed to delete group'
      }
    },
    students: {
      title: 'Students',
      subtitle: 'Manage your students',
      addStudent: 'Add Student',
      firstName: 'First Name',
      lastName: 'Last Name',
      dateOfBirth: 'Date of Birth',
      parentName: 'Parent Name',
      parentPhone: 'Parent Phone',
      email: 'Email',
      cancel: 'Cancel',
      update: 'Update',
      confirmDelete: 'Are you sure you want to delete this student?',
      noBranches: 'You need to create a branch first before adding students',
      noGroups: 'You need to create a group first before adding students',
      noStudents: 'No students added yet',
      addFirstStudent: 'Add your first student',
      success: {
        add: 'Student added successfully',
        update: 'Student updated successfully',
        delete: 'Student deleted successfully'
      },
      error: {
        add: 'Failed to add student',
        update: 'Failed to update student',
        delete: 'Failed to delete student'
      }
    },
    trainers: {
      title: 'Trainers',
      subtitle: 'Manage your trainers',
      addTrainer: 'Add Trainer',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      specialization: 'Specialization',
      assignGroups: 'Assign Groups',
      assignedGroups: 'Assigned Groups',
      cancel: 'Cancel',
      update: 'Update',
      confirmDelete: 'Are you sure you want to delete this trainer?',
      noBranches: 'You need to create a branch first before adding trainers',
      noGroups: 'You need to create a group first before adding trainers',
      noTrainers: 'No trainers added yet',
      addFirstTrainer: 'Add your first trainer',
      success: {
        add: 'Trainer added successfully',
        update: 'Trainer updated successfully',
        delete: 'Trainer deleted successfully'
      },
      error: {
        add: 'Failed to add trainer',
        update: 'Failed to update trainer',
        delete: 'Failed to delete trainer'
      }
    },
    attendance: {
      title: 'Take Attendance',
      subtitle: 'Track student attendance',
      branch: 'Branch',
      group: 'Group',
      date: 'Date',
      timeSlot: 'Time Slot',
      studentList: 'Student List',
      markAllPresent: 'Mark All Present',
      markAllAbsent: 'Mark All Absent',
      saving: 'Saving...',
      saveAttendance: 'Save Attendance',
      noBranches: 'No branches available',
      noGroups: 'No groups available',
      noStudents: 'No students in this group',
      success: {
        save: 'Attendance saved successfully'
      },
      error: {
        save: 'Failed to save attendance'
      }
    },
    attendanceRecords: {
      title: 'Attendance Records',
      subtitle: 'View and manage attendance records',
      branch: 'Branch',
      group: 'Group',
      startDate: 'Start Date',
      endDate: 'End Date',
      search: 'Search',
      export: 'Export',
      date: 'Date',
      timeSlot: 'Time Slot',
      present: 'Present',
      absent: 'Absent',
      noBranches: 'No branches available',
      noRecords: 'No attendance records found',
      success: {
        export: 'Records exported successfully'
      }
    },
    studentProgress: {
      title: 'Student Progress',
      subtitle: 'Track and monitor student development',
      selectStudent: 'Select Student',
      selectStudentPrompt: 'Please select a student to view progress',
      addRecord: 'Add Progress Record',
      date: 'Date',
      height: 'Height',
      weight: 'Weight',
      verticalJump: 'Vertical Jump',
      speedTest: 'Speed Test',
      academicScore: 'Academic Score',
      notes: 'Notes',
      notesPlaceholder: 'Add any additional notes here...',
      progressChart: 'Progress Chart',
      noBranches: 'No branches available',
      noRecords: 'No progress records found',
      addFirstRecord: 'Add first progress record',
      cancel: 'Cancel',
      update: 'Update',
      success: {
        add: 'Progress record added successfully',
        update: 'Progress record updated successfully'
      },
      error: {
        add: 'Failed to add progress record',
        update: 'Failed to update progress record'
      }
    },
    matchSchedule: {
      title: 'Match Schedule',
      subtitle: 'Manage upcoming and past matches',
      addMatch: 'Add Match',
      editMatch: 'Edit Match',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      locationPlaceholder: 'Enter match location',
      opponent: 'Opponent',
      opponentPlaceholder: 'Enter opponent team name',
      homeTeam: 'Home',
      awayTeam: 'Away',
      homeScore: 'Home Score',
      awayScore: 'Away Score',
      notes: 'Notes',
      notesPlaceholder: 'Add match notes...',
      status: 'Status',
      filters: 'Filters',
      search: 'Search',
      searchPlaceholder: 'Search by opponent or location',
      allMatches: 'All Matches',
      upcoming: 'Upcoming',
      inProgress: 'In Progress',
      completed: 'Completed',
      today: 'Today',
      noMatches: 'No matches found',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      confirmDelete: 'Are you sure you want to delete this match?',
      success: {
        add: 'Match added successfully',
        update: 'Match updated successfully',
        delete: 'Match deleted successfully'
      },
      error: {
        add: 'Failed to add match',
        update: 'Failed to update match',
        delete: 'Failed to delete match'
      }
    },
    payments: {
      title: 'Payments',
      subtitle: 'Manage payments and transactions',
      overview: 'Overview',
      history: 'Payment History',
      add: 'Add Payment',
      income: 'Income',
      expense: 'Expense',
      amount: 'Amount',
      category: 'Category',
      dueDate: 'Due Date',
      description: 'Description',
      saving: 'Saving...',
      save: 'Save',
      update: 'Update',
      cancel: 'Cancel',
      categories: {
        membership: 'Membership',
        training: 'Training',
        tournament: 'Tournament',
        equipment: 'Equipment',
        facility: 'Facility',
        salary: 'Salary',
        other: 'Other'
      },
      statuses: {
        pending: 'Pending',
        completed: 'Completed',
        failed: 'Failed',
        refunded: 'Refunded'
      },
      filters: {
        all: 'All Time',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        custom: 'Custom Range'
      },
      success: {
        add: 'Payment added successfully',
        update: 'Payment updated successfully',
        delete: 'Payment deleted successfully'
      },
      error: {
        add: 'Failed to add payment',
        update: 'Failed to update payment',
        delete: 'Failed to delete payment'
      }
    },
    finance: {
      title: 'Financial Management',
      subtitle: 'Manage your club finances',
      overview: 'Overview',
      expenses: 'Expense Management',
      budget: 'Budget Planning',
      reports: 'Financial Reports',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      netIncome: 'Net Income',
      categories: {
        membership: 'Membership',
        training: 'Training',
        tournament: 'Tournament',
        equipment: 'Equipment',
        facility: 'Facility',
        salary: 'Salary',
        other: 'Other'
      }
    },
    settings: {
      title: 'Settings',
      theme: 'Theme',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      english: 'English',
      turkish: 'Turkish',
      save: 'Save Changes'
    }
  },
  tr: {
    auth: {
      welcome: 'Tekrar Hoşgeldiniz',
      signIn: 'Kulübünüzü yönetmek için giriş yapın',
      email: 'E-posta Adresi',
      password: 'Şifre',
      loginButton: 'Giriş Yap',
      loggingIn: 'Giriş yapılıyor...'
    },
    dashboard: {
      title: 'Panel',
      subtitle: 'Kulüp aktivitelerinize genel bakış',
      totalStudents: 'Toplam Öğrenci',
      totalGroups: 'Toplam Grup',
      totalTrainers: 'Toplam Eğitmen',
      recentActivity: 'Son Aktiviteler',
      upcomingClasses: 'Yaklaşan Dersler',
      noActivity: 'Yakın zamanda aktivite yok',
      noClasses: 'Yaklaşan ders yok'
    },
    branches: {
      title: 'Şubeler',
      subtitle: 'Kulüp şubelerini yönet',
      addBranch: 'Şube Ekle',
      branchName: 'Şube Adı',
      branchAddress: 'Şube Adresi',
      cancel: 'İptal',
      update: 'Güncelle',
      confirmDelete: 'Bu şubeyi silmek istediğinizden emin misiniz?',
      noBranches: 'Henüz şube eklenmemiş',
      addFirstBranch: 'İlk şubenizi ekleyin',
      success: {
        add: 'Şube başarıyla eklendi',
        update: 'Şube başarıyla güncellendi',
        delete: 'Şube başarıyla silindi'
      },
      error: {
        add: 'Şube eklenirken hata oluştu',
        update: 'Şube güncellenirken hata oluştu',
        delete: 'Şube silinirken hata oluştu'
      }
    },
    groups: {
      title: 'Gruplar',
      subtitle: 'Antrenman gruplarını yönet',
      addGroup: 'Grup Ekle',
      groupName: 'Grup Adı',
      description: 'Açıklama',
      capacity: 'Kapasite',
      ageGroup: 'Yaş Grubu',
      ageGroupPlaceholder: 'örn: 8-10',
      schedule: 'Program',
      schedulePlaceholder: 'örn: Pzt, Çar 16:00-17:30',
      cancel: 'İptal',
      update: 'Güncelle',
      confirmDelete: 'Bu grubu silmek istediğinizden emin misiniz?',
      noBranches: 'Grup eklemeden önce bir şube oluşturmanız gerekiyor',
      noGroups: 'Henüz grup eklenmemiş',
      addFirstGroup: 'İlk grubunuzu ekleyin',
      students: 'Öğrenci',
      trainers: 'Eğitmen',
      success: {
        add: 'Grup başarıyla eklendi',
        update: 'Grup başarıyla güncellendi',
        delete: 'Grup başarıyla silindi'
      },
      error: {
        add: 'Grup eklenirken hata oluştu',
        update: 'Grup güncellenirken hata oluştu',
        delete: 'Grup silinirken hata oluştu'
      }
    },
    students: {
      title: 'Öğrenciler',
      subtitle: 'Öğrencileri yönet',
      addStudent: 'Öğrenci Ekle',
      firstName: 'Ad',
      lastName: 'Soyad',
      dateOfBirth: 'Doğum Tarihi',
      parentName: 'Veli Adı',
      parentPhone: 'Veli Telefonu',
      email: 'E-posta',
      cancel: 'İptal',
      update: 'Güncelle',
      confirmDelete: 'Bu öğrenciyi silmek istediğinizden emin misiniz?',
      noBranches: 'Öğrenci eklemeden önce bir şube oluşturmanız gerekiyor',
      noGroups: 'Öğrenci eklemeden önce bir grup oluşturmanız gerekiyor',
      noStudents: 'Henüz öğrenci eklenmemiş',
      addFirstStudent: 'İlk öğrencinizi ekleyin',
      success: {
        add: 'Öğrenci başarıyla eklendi',
        update: 'Öğrenci başarıyla güncellendi',
        delete: 'Öğrenci başarıyla silindi'
      },
      error: {
        add: 'Öğrenci eklenirken hata oluştu',
        update: 'Öğrenci güncellenirken hata oluştu',
        delete: 'Öğrenci silinirken hata oluştu'
      }
    },
    trainers: {
      title: 'Eğitmenler',
      subtitle: 'Eğitmenleri yönet',
      addTrainer: 'Eğitmen Ekle',
      firstName: 'Ad',
      lastName: 'Soyad',
      email: 'E-posta',
      phone: 'Telefon',
      specialization: 'Uzmanlık',
      assignGroups: 'Grup Atamaları',
      assignedGroups: 'Atanan Gruplar',
      cancel: 'İptal',
      update: 'Güncelle',
      confirmDelete: 'Bu eğitmeni silmek istediğinizden emin misiniz?',
      noBranches: 'Eğitmen eklemeden önce bir şube oluşturmanız gerekiyor',
      noGroups: 'Eğitmen eklemeden önce bir grup oluşturmanız gerekiyor',
      noTrainers: 'Henüz eğitmen eklenmemiş',
      addFirstTrainer: 'İlk eğitmeninizi ekleyin',
      success: {
        add: 'Eğitmen başarıyla eklendi',
        update: 'Eğitmen başarıyla güncellendi',
        delete: 'Eğitmen başarıyla silindi'
      },
      error: {
        add: 'Eğitmen eklenirken hata oluştu',
        update: 'Eğitmen güncellenirken hata oluştu',
        delete: 'Eğitmen silinirken hata oluştu'
      }
    },
    attendance: {
      title: 'Yoklama Al',
      subtitle: 'Öğrenci yoklaması',
      branch: 'Şube',
      group: 'Grup',
      date: 'Tarih',
      timeSlot: 'Saat',
      studentList: 'Öğrenci Listesi',
      markAllPresent: 'Tümünü Var İşaretle',
      markAllAbsent: 'Tümünü Yok İşaretle',
      saving: 'Kaydediliyor...',
      saveAttendance: 'Yoklamayı Kaydet',
      noBranches: 'Şube bulunamadı',
      noGroups: 'Grup bulunamadı',
      noStudents: 'Bu grupta öğrenci yok',
      success: {
        save: 'Yoklama başarıyla kaydedildi'
      },
      error: {
        save: 'Yoklama kaydedilirken hata oluştu'
      }
    },
    attendanceRecords: {
      title: 'Yoklama Kayıtları',
      subtitle: 'Yoklama kayıtlarını görüntüle ve yönet',
      branch: 'Şube',
      group: 'Grup',
      startDate: 'Başlangıç Tarihi',
      endDate: 'Bitiş Tarihi',
      search: 'Ara',
      export: 'Dışa Aktar',
      date: 'Tarih',
      timeSlot: 'Saat',
      present: 'Var',
      absent: 'Yok',
      noBranches: 'Şube bulunamadı',
      noRecords: 'Yoklama kaydı bulunamadı',
      success: {
        export: 'Kayıtlar başarıyla dışa aktarıldı'
      }
    },
    studentProgress: {
      title: 'Öğrenci Gelişimi',
      subtitle: 'Öğrenci gelişimini takip et',
      selectStudent: 'Öğrenci Seç',
      selectStudentPrompt: 'Lütfen gelişimini görmek için bir öğrenci seçin',
      addRecord: 'Gelişim Kaydı Ekle',
      date: 'Tarih',
      height: 'Boy',
      weight: 'Kilo',
      verticalJump: 'Dikey Sıçrama',
      speedTest: 'Sürat Testi',
      academicScore: 'Akademik Puan',
      notes: 'Notlar',
      notesPlaceholder: 'Ek notlar ekleyin...',
      progressChart: 'Gelişim Grafiği',
      noBranches: 'Şube bulunamadı',
      noRecords: 'Gelişim kaydı bulunamadı',
      addFirstRecord: 'İlk gelişim kaydını ekle',
      cancel: 'İptal',
      update: 'Güncelle',
      success: {
        add: 'Gelişim kaydı başarıyla eklendi',
        update: 'Gelişim kaydı başarıyla güncellendi'
      },
      error: {
        add: 'Gelişim kaydı eklenirken hata oluştu',
        update: 'Gelişim kaydı güncellenirken hata oluştu'
      }
    },
    matchSchedule: {
      title: 'Maç Programı',
      subtitle: 'Yaklaşan ve geçmiş maçları yönet',
      addMatch: 'Maç Ekle',
      editMatch: 'Maç Düzenle',
      date: 'Tarih',
      time: 'Saat',
      location: 'Konum',
      locationPlaceholder: 'Maç konumunu girin',
      opponent: 'Rakip',
      opponentPlaceholder: 'Rakip takım adını girin',
      homeTeam: 'Ev Sahibi',
      awayTeam: 'Deplasman',
      homeScore: 'Ev Sahibi Skoru',
      awayScore: 'Deplasman Skoru',
      notes: 'Notlar',
      notesPlaceholder: 'Maç notları ekleyin...',
      status: 'Durum',
      filters: 'Filtreler',
      search: 'Ara',
      searchPlaceholder: 'Rakip veya konum ara',
      allMatches: 'Tüm Maçlar',
      upcoming: 'Yaklaşan',
      inProgress: 'Devam Eden',
      completed: 'Tamamlanan',
      today: 'Bugün',
      noMatches: 'Maç bulunamadı',
      cancel: 'İptal',
      save: 'Kaydet',
      update: 'Güncelle',
      confirmDelete: 'Bu maçı silmek istediğinizden emin misiniz?',
      success: {
        add: 'Maç başarıyla eklendi',
        update: 'Maç başarıyla güncellendi',
        delete: 'Maç başarıyla silindi'
      },
      error: {
        add: 'Maç eklenirken hata oluştu',
        update: 'Maç güncellenirken hata oluştu',
        delete: 'Maç silinirken hata oluştu'
      }
    },
    payments: {
      title: 'Ödemeler',
      subtitle: 'Ödemeleri ve işlemleri yönet',
      overview: 'Genel Bakış',
      history: 'Ödeme Geçmişi',
      add: 'Ödeme Ekle',
      income: 'Gelir',
      expense: 'Gider',
      amount: 'Tutar',
      category: 'Kategori',
      dueDate: 'Son Ödeme Tarihi',
      description: 'Açıklama',
      saving: 'Kaydediliyor...',
      save: 'Kaydet',
      update: 'Güncelle',
      cancel: 'İptal',
      categories: {
        membership: 'Üyelik',
        training: 'Antrenman',
        tournament: 'Turnuva',
        equipment: 'Ekipman',
        facility: 'T esis',
        salary: 'Maaş',
        other: 'Diğer'
      },
      statuses: {
        pending: 'Beklemede',
        completed: 'Tamamlandı',
        failed: 'Başarısız',
        refunded: 'İade Edildi'
      },
      filters: {
        all: 'Tüm Zamanlar',
        thisMonth: 'Bu Ay',
        lastMonth: 'Geçen Ay',
        custom: 'Özel Aralık'
      },
      success: {
        add: 'Ödeme başarıyla eklendi',
        update: 'Ödeme başarıyla güncellendi',
        delete: 'Ödeme başarıyla silindi'
      },
      error: {
        add: 'Ödeme eklenirken hata oluştu',
        update: 'Ödeme güncellenirken hata oluştu',
        delete: 'Ödeme silinirken hata oluştu'
      }
    },
    finance: {
      title: 'Finans Yönetimi',
      subtitle: 'Kulüp finanslarını yönet',
      overview: 'Genel Bakış',
      expenses: 'Gider Yönetimi',
      budget: 'Bütçe Planlama',
      reports: 'Finansal Raporlar',
      totalIncome: 'Toplam Gelir',
      totalExpenses: 'Toplam Gider',
      netIncome: 'Net Gelir',
      categories: {
        membership: 'Üyelik',
        training: 'Antrenman',
        tournament: 'Turnuva',
        equipment: 'Ekipman',
        facility: 'Tesis',
        salary: 'Maaş',
        other: 'Diğer'
      }
    },
    settings: {
      title: 'Ayarlar',
      theme: 'Tema',
      language: 'Dil',
      light: 'Aydınlık',
      dark: 'Karanlık',
      english: 'İngilizce',
      turkish: 'Türkçe',
      save: 'Değişiklikleri Kaydet'
    }
  }
};