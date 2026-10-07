import {
  AfterViewInit,
  Component,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface MenuItem {
  name: string;
  hindi: string;
  price?: number;
  half?: number;
  full?: number;
  note?: string;
}


interface MenuCategory {
  name: string;
  hindi: string;
  items: MenuItem[];
}


@Component({
  selector: 'app-menu',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './menu.html',

  styleUrl: './menu.css'
})


export class Menu implements AfterViewInit, OnDestroy {


  // Currently active category
  selectedCategory = 'STARTERS';


  // Search
  searchText = '';


  // Intersection Observer
  private observer!: IntersectionObserver;


  // =====================================================
  // MENU DATA
  // =====================================================

  categories: MenuCategory[] = [

    // ===================================================
    // STARTERS
    // ===================================================

    {
      name: 'STARTERS',
      hindi: 'स्टार्टर्स',

      items: [

        {
          name: 'Vegetable Pakoda',
          hindi: 'वेजिटेबल पकोड़ा',
          price: 120
        },

        {
          name: 'Peanut Chaat',
          hindi: 'पीनट चाट',
          price: 120
        },

        {
          name: 'Salted French Fries',
          hindi: 'साल्टेड फ्रेंच फ्राइज़',
          price: 120
        },

        {
          name: 'Chana Roasted',
          hindi: 'चना रोस्टेड',
          price: 130
        },

        {
          name: 'Peri Peri French Fries',
          hindi: 'पेरी-पेरी फ्रेंच फ्राइज़',
          price: 140
        },

        {
          name: 'Paneer Pakoda',
          hindi: 'पनीर पकोड़ा',
          price: 160
        }

      ]
    },


    // ===================================================
    // PAPAD
    // ===================================================

    {
      name: 'PAPAD',
      hindi: 'पापड़',

      items: [

        {
          name: 'Papad Roasted',
          hindi: 'पापड़ रोस्टेड',
          price: 20
        },

        {
          name: 'Papad Fry',
          hindi: 'पापड़ फ्राई',
          price: 30
        },

        {
          name: 'Papad Fry Masala',
          hindi: 'पापड़ फ्राई मसाला',
          price: 35
        }

      ]
    },


    // ===================================================
    // SOUP
    // ===================================================

    {
      name: 'SOUP',
      hindi: 'सूप',

      items: [

        {
          name: 'Tomato Soup',
          hindi: 'टोमेटो सूप',
          price: 100
        },

        {
          name: 'Manchau Soup',
          hindi: 'मनचाऊ सूप',
          price: 100
        }

      ]
    },


    // ===================================================
    // RAITA & DAHI
    // ===================================================

    {
      name: 'RAITA & DAHI',
      hindi: 'रायता & दही',

      items: [

        {
          name: 'Butter Milk',
          hindi: 'छाछ',
          full: 30
        },

        {
          name: 'Plain Dahi',
          hindi: 'प्लेन दही',
          half: 40,
          full: 80
        },

        {
          name: 'Lassi',
          hindi: 'लस्सी',
          full: 70
        },

        {
          name: 'Vegetable Raita',
          hindi: 'वेजिटेबल रायता',
          full: 100
        },

        {
          name: 'Boondi Raita',
          hindi: 'बूंदी रायता',
          full: 100
        },

        {
          name: 'Boondi Raita Tadka',
          hindi: 'बूंदी रायता तड़का',
          full: 110
        },

        {
          name: 'Fruit Raita',
          hindi: 'फ्रूट रायता',
          full: 120
        }

      ]
    },


    // ===================================================
    // CHINESE
    // ===================================================

    {
      name: 'CHINESE',
      hindi: 'चाइनीस',

      items: [

        {
          name: 'Gravy Manchurian',
          hindi: 'ग्रेवी मंचूरियन',
          price: 120
        },

        {
          name: 'Dry Manchurian',
          hindi: 'ड्राय मंचूरियन',
          price: 120
        },

        {
          name: 'Noodles',
          hindi: 'नूडल्स',
          price: 120
        },

        {
          name: 'Garlic Noodles',
          hindi: 'गार्लिक नूडल्स',
          price: 130
        },

        {
          name: 'Veg Hakka Noodles',
          hindi: 'वेज हक्का नूडल्स',
          price: 140
        },

        {
          name: 'Vegetable Fried Rice',
          hindi: 'वेजिटेबल फ्राइड राइस',
          price: 140
        },

        {
          name: 'Manchurian Fried Rice',
          hindi: 'मंचूरियन फ्राइड राइस',
          price: 149
        },

        {
          name: 'Honey Chilli Potato',
          hindi: 'हनी चिल्ली पोटैटो',
          price: 159
        },

        {
          name: 'Chilli Paneer Potato',
          hindi: 'चिल्ली पनीर पोटैटो',
          price: 170
        },

        {
          name: 'Paneer Chilli Dry',
          hindi: 'पनीर चिल्ली ड्राय',
          price: 180
        },

        {
          name: 'Paneer Chilli Gravy',
          hindi: 'पनीर चिल्ली ग्रेवी',
          price: 180
        },

        {
          name: 'Chinese Mix Special',
          hindi: 'चाइनीस मिक्स स्पेशल',
          price: 198
        }

      ]
    },


    // ===================================================
    // PANEER
    // ===================================================

    {
      name: 'PANEER',
      hindi: 'पनीर',

      items: [

        {
          name: 'Matar Paneer',
          hindi: 'मटर पनीर',
          half: 150,
          full: 199
        },

        {
          name: 'Palak Paneer',
          hindi: 'पालक पनीर',
          half: 150,
          full: 199
        },

        {
          name: 'Butter Paneer Masala',
          hindi: 'बटर पनीर मसाला',
          half: 150,
          full: 199
        },

        {
          name: 'Paneer Punjabi',
          hindi: 'पनीर पंजाबी',
          half: 150,
          full: 199
        },

        {
          name: 'Shahi Paneer',
          hindi: 'शाही पनीर',
          half: 150,
          full: 199
        },

        {
          name: 'Laccha Paneer',
          hindi: 'लच्छा पनीर',
          price: 210
        },

        {
          name: 'Tawa Paneer',
          hindi: 'तवा पनीर',
          price: 210
        },

        {
          name: 'Paneer Marwadi',
          hindi: 'पनीर मारवाड़ी',
          price: 210
        },

        {
          name: 'Paneer Lababdar',
          hindi: 'पनीर लबाबदार',
          price: 210
        },

        {
          name: 'Kadai Paneer',
          hindi: 'कढ़ाई पनीर',
          price: 219
        },

        {
          name: 'Paneer Do Pyaza',
          hindi: 'पनीर दो प्याजा',
          price: 219
        },

        {
          name: 'Paneer Angara',
          hindi: 'पनीर अंगारा',
          price: 219
        },

        {
          name: 'Paneer Kolhapuri',
          hindi: 'पनीर कोल्हापुरी',
          price: 219
        },

        {
          name: 'Paneer Tikka Masala',
          hindi: 'पनीर टिक्का मसाला',
          price: 219
        },

        {
          name: 'Paneer Harabhra',
          hindi: 'पनीर हराभरा',
          price: 219
        },

        {
          name: 'Paneer Bhurji',
          hindi: 'पनीर भुर्जी',
          price: 219
        },

        {
          name: 'Paneer Korma',
          hindi: 'पनीर कोरमा',
          price: 219
        },

        {
          name: 'Malai Paneer',
          hindi: 'मलाई पनीर',
          price: 219
        },

        {
          name: 'Handi Paneer Special',
          hindi: 'हांडी पनीर स्पेशल',
          price: 229
        },

        {
          name: 'Paneer Chatpata',
          hindi: 'पनीर चटपटा',
          price: 229
        },

        {
          name: 'Paneer Maharaja',
          hindi: 'पनीर महाराजा',
          price: 229
        },

        {
          name: 'Paneer Patiala',
          hindi: 'पनीर पटियाला',
          price: 229
        },

        {
          name: 'Paneer Pasanda',
          hindi: 'पनीर पसंदा',
          price: 250
        },

        {
          name: 'Anand Special Paneer',
          hindi: 'आनंद स्पेशल पनीर',
          price: 300
        }

      ]
    },


    // ===================================================
    // MAIN COURSE
    // ===================================================

    {
      name: 'MAIN COURSE',
      hindi: 'मुख्य व्यंजन',

      items: [

        {
          name: 'Besan Gatte',
          hindi: 'बेसन गट्टे',
          price: 149
        },

        {
          name: 'Masala Bhindi',
          hindi: 'मसाला भिंडी',
          price: 149,
          note: 'Seasonal'
        },

        {
          name: 'Sev Tamatar',
          hindi: 'सेव टमाटर',
          half: 110,
          full: 149
        },

        {
          name: 'Matar Masala',
          hindi: 'मटर मसाला',
          half: 110,
          full: 149
        },

        {
          name: 'Chana Masala',
          hindi: 'चना मसाला',
          half: 110,
          full: 149
        },

        {
          name: 'Aloo Matar',
          hindi: 'आलू मटर',
          half: 110,
          full: 149
        },

        {
          name: 'Aloo Chhola',
          hindi: 'आलू छोला',
          half: 110,
          full: 149
        },

        {
          name: 'Jeera Aloo',
          hindi: 'जीरा आलू',
          price: 149
        },

        {
          name: 'Mix Vegetable',
          hindi: 'मिक्स वेजिटेबल',
          price: 169
        },

        {
          name: 'Sev Doodh',
          hindi: 'सेव दूध',
          price: 170
        },

        {
          name: 'Vegetable Do Pyaza',
          hindi: 'वेजिटेबल दो प्याजा',
          price: 180
        },

        {
          name: 'Mashroom Masala',
          hindi: 'मशरूम मसाला',
          half: 140,
          full: 180
        },

        {
          name: 'Kashmiri Dum Aloo',
          hindi: 'कश्मीरी दम आलू',
          price: 190
        },

        {
          name: 'Vegetable Kolhapuri',
          hindi: 'वेजिटेबल कोल्हापुरी',
          price: 190
        },

        {
          name: 'Dum Aloo',
          hindi: 'दम आलू',
          price: 190
        },

        {
          name: 'Stuffed Tomato',
          hindi: 'स्टफ़्ड टोमैटो',
          price: 190
        },

        {
          name: 'Special Capsicum',
          hindi: 'स्पेशल केप्सिकम',
          price: 210
        },

        {
          name: 'Methi Malai Matar',
          hindi: 'मेथी मलाई मटर',
          price: 220
        }

      ]
    },


    // ===================================================
    // RICE
    // ===================================================

    {
      name: 'RICE',
      hindi: 'चावल',

      items: [

        {
          name: 'Steam Rice',
          hindi: 'स्टीम राइस',
          half: 80,
          full: 100
        },

        {
          name: 'Jeera Rice',
          hindi: 'जीरा राइस',
          half: 90,
          full: 110
        },

        {
          name: 'Masala Rice',
          hindi: 'मसाला राइस',
          half: 90,
          full: 120
        },

        {
          name: 'Onion Rice',
          hindi: 'ऑनियन राइस',
          half: 90,
          full: 120
        },

        {
          name: 'Matar Pulao',
          hindi: 'मटर पुलाव',
          half: 120,
          full: 159
        },

        {
          name: 'Butter Khichdi',
          hindi: 'बटर खिचड़ी',
          half: 120,
          full: 170
        },

        {
          name: 'Paneer Pulao',
          hindi: 'पनीर पुलाव',
          price: 180
        },

        {
          name: 'Vegetable Pulao',
          hindi: 'वेजिटेबल पुलाव',
          price: 180
        },

        {
          name: 'Kaju Pulao',
          hindi: 'काजू पुलाव',
          price: 190
        },

        {
          name: 'Shahi Pulao',
          hindi: 'शाही पुलाव',
          price: 190
        },

        {
          name: 'Hyderabadi Biryani',
          hindi: 'हैदराबादी बिरयानी',
          price: 210
        }

      ]
    },


    // ===================================================
    // KAJU
    // ===================================================

    {
      name: 'KAJU',
      hindi: 'काजू',

      items: [

        {
          name: 'Kaju Curry',
          hindi: 'काजू करी',
          half: 169,
          full: 210
        },

        {
          name: 'Kaju Masala',
          hindi: 'काजू मसाला',
          half: 169,
          full: 210
        },

        {
          name: 'Kaju Paneer',
          hindi: 'काजू पनीर',
          price: 219
        },

        {
          name: 'Kaju Angara',
          hindi: 'काजू अंगारा',
          price: 219
        },

        {
          name: 'Kaju Cheez Masala',
          hindi: 'काजू चीज मसाला',
          price: 229
        }

      ]
    },


    // ===================================================
    // DAL
    // ===================================================

    {
      name: 'DAL',
      hindi: 'दाल',

      items: [

        {
          name: 'Dal Fry',
          hindi: 'दाल फ्राई',
          half: 100,
          full: 129
        },

        {
          name: 'Dal Jeera',
          hindi: 'दाल जीरा',
          half: 100,
          full: 129
        },

        {
          name: 'Dal Tadka',
          hindi: 'दाल तड़का',
          half: 100,
          full: 139
        },

        {
          name: 'Dal Gujrati',
          hindi: 'दाल गुजराती',
          half: 100,
          full: 139
        },

        {
          name: 'Dal Butter',
          hindi: 'दाल बटर',
          price: 149
        },

        {
          name: 'Dal Handi',
          hindi: 'दाल हांडी',
          price: 150
        }

      ]
    },


    // ===================================================
    // KOFTA
    // ===================================================

    {
      name: 'KOFTA',
      hindi: 'कोफ्ता',

      items: [

        {
          name: 'Vegetable Kofta',
          hindi: 'वेजिटेबल कोफ्ता',
          price: 180
        },

        {
          name: 'Malai Kofta',
          hindi: 'मलाई कोफ्ता',
          price: 190
        },

        {
          name: 'Nargis Kofta',
          hindi: 'नरगिस कोफ्ता',
          price: 198
        },

        {
          name: 'Kaju Kofta',
          hindi: 'काजू कोफ्ता',
          price: 219
        },

        {
          name: 'Paneer Kofta',
          hindi: 'पनीर कोफ्ता',
          price: 219
        },

        {
          name: 'Cheez Kofta',
          hindi: 'चीज़ कोफ्ता',
          price: 229
        }

      ]
    },


    // ===================================================
    // SALAD
    // ===================================================

    {
      name: 'SALAD',
      hindi: 'सलाद',

      items: [

        {
          name: 'Onion Salad',
          hindi: 'ऑनियन सलाद',
          price: 20
        },

        {
          name: 'Green Salad',
          hindi: 'ग्रीन सलाद',
          price: 40
        },

        {
          name: 'Sirka Onion',
          hindi: 'सिरका प्याज',
          price: 40
        },

        {
          name: 'Punjabi Salad',
          hindi: 'पंजाबी सलाद',
          price: 50
        },

        {
          name: 'Kachumber Salad',
          hindi: 'कचुंबर सलाद',
          price: 60
        }

      ]
    },


    // ===================================================
    // BREADS
    // ===================================================

    {
      name: 'BREADS',
      hindi: 'रोटी',

      items: [

        {
          name: 'Plain Tawa Roti',
          hindi: 'प्लेन तवा रोटी',
          price: 10
        },

        {
          name: 'Butter Tawa Roti',
          hindi: 'बटर तवा रोटी',
          price: 12
        },

        {
          name: 'Plain Tandoori Roti',
          hindi: 'प्लेन तंदूरी रोटी',
          price: 12
        },

        {
          name: 'Butter Tandoori Roti',
          hindi: 'बटर तंदूरी रोटी',
          price: 15
        },

        {
          name: 'Tawa Pratha',
          hindi: 'तवा पराठा',
          price: 25
        },

        {
          name: 'Lachha Pratha',
          hindi: 'लच्छा पराठा',
          price: 30
        },

        {
          name: 'Missi Roti',
          hindi: 'मिस्सी रोटी',
          price: 30
        },

        {
          name: 'Butter Missi Roti',
          hindi: 'बटर मिस्सी रोटी',
          price: 35
        },

        {
          name: 'Makka Roti',
          hindi: 'मक्का रोटी',
          price: 35
        },

        {
          name: 'Aloo Pratha',
          hindi: 'आलू पराठा',
          price: 50
        },

        {
          name: 'Sev Pratha',
          hindi: 'सेव पराठा',
          price: 50
        },

        {
          name: 'Stuffed Naan',
          hindi: 'स्टफ़्ड नान',
          price: 60
        },

        {
          name: 'Garlic Naan',
          hindi: 'गार्लिक नान',
          price: 60
        },

        {
          name: 'Butter Kulcha',
          hindi: 'बटर कुलचा',
          price: 60
        },

        {
          name: 'Paneer Pratha',
          hindi: 'पनीर पराठा',
          price: 60
        },

        {
          name: 'Butter Naan',
          hindi: 'बटर नान',
          price: 70
        },

        {
          name: 'Cheez Naan',
          hindi: 'चीज नान',
          price: 70
        },

        {
          name: 'Cheez Garlic Naan',
          hindi: 'चीज गार्लिक नान',
          price: 80
        }

      ]
    }

  ];


  // =====================================================
  // SEARCH
  // =====================================================

  get filteredCategories(): MenuCategory[] {

    if (!this.searchText.trim()) {
      return this.categories;
    }

    const search =
      this.searchText.toLowerCase().trim();

    return this.categories

      .map(category => ({

        ...category,

        items: category.items.filter(item =>

          item.name
            .toLowerCase()
            .includes(search)

          ||

          item.hindi
            .includes(this.searchText.trim())

        )

      }))

      .filter(category =>
        category.items.length > 0
      );

  }


  // =====================================================
  // HALF / FULL PRICE CHECK
  // =====================================================

  hasHalfFullPrices(
    category: MenuCategory
  ): boolean {

    return category.items.some(
      item =>
        item.half !== undefined ||
        item.full !== undefined
    );

  }


  // =====================================================
  // CATEGORY CLICK
  // =====================================================

  selectCategory(category: string) {

    this.selectedCategory = category;

    setTimeout(() => {

      const element =
        document.getElementById(
          'category-' + category
        );

      if (element) {

        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

      }

    }, 50);

  }


  // =====================================================
  // INTERSECTION OBSERVER
  // =====================================================

  ngAfterViewInit() {

    this.setupCategoryObserver();

  }


  setupCategoryObserver() {

    this.observer =
      new IntersectionObserver(

        entries => {

          const visibleSections =
            entries

              .filter(
                entry =>
                  entry.isIntersecting
              )

              .sort(
                (a, b) =>
                  a.boundingClientRect.top -
                  b.boundingClientRect.top
              );


          if (
            visibleSections.length > 0
          ) {

            const id =
              visibleSections[0]
                .target
                .id;


            const category =
              id.replace(
                'category-',
                ''
              );


            this.selectedCategory =
              category;

          }

        },

        {

          root: null,

          threshold: 0.15,

          rootMargin:
            '-120px 0px -50% 0px'

        }

      );


    setTimeout(() => {

      document
        .querySelectorAll(
          '[id^="category-"]'
        )

        .forEach(section => {

          this.observer.observe(
            section
          );

        });

    }, 200);

  }


  // =====================================================
  // CLEANUP
  // =====================================================

  ngOnDestroy() {

    if (this.observer) {

      this.observer.disconnect();

    }

  }

}