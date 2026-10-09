import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment.development';

interface MenuItem {
  _id?: string;
  categoryId: string;

  name: string;
  hindi: string;

  price?: number | null;
  half?: number | null;
  full?: number | null;

  note?: string | null;

  sortOrder?: number;
  status?: 'Active' | 'Inactive';
}

interface MenuCategory {
  _id?: string;

  name: string;
  hindi: string;

  sortOrder?: number;
  status?: 'Active' | 'Inactive';

  items: MenuItem[];
}

interface ApiMenuItem {
  _id?: string;
  categoryId: string;

  name: string;
  hindi: string;

  price?: number | null;
  half?: number | null;
  full?: number | null;

  note?: string | null;

  sortOrder?: number;
  status?: 'Active' | 'Inactive';
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
export class Menu implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('categoryContainer')
categoryContainer!: ElementRef<HTMLDivElement>;

@ViewChildren('categoryButton')
categoryButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  // API URL

  categoryApiUrl = `${environment.apiUrl}/menuCategories`;

  itemApiUrl = `${environment.apiUrl}/menuItems`;


  // MENU DATA

  categories: MenuCategory[] = [];

  selectedCategory = 'STARTERS';

  searchText = '';


  // LOADING

  isLoading = false;

  isMenuLoading: boolean = true;

  errorMessage = '';


  // INTERSECTION OBSERVER

  private observer!: IntersectionObserver;


  // CONSTRUCTOR

  constructor(
    private http: HttpClient
  ) {}


  // INIT

  ngOnInit(): void {

    this.getMenuData();

  }

  scrollActiveCategoryIntoView(): void {
    const activeButton = this.categoryButtons?.find(
      button =>
        button.nativeElement.dataset['category'] ===
        this.selectedCategory
    );
  
    activeButton?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }

  // GET MENU DATA

  getMenuData(): void {

    this.isMenuLoading = true;

    this.errorMessage = '';


    // Get Categories
    this.http.get<MenuCategory[]>(this.categoryApiUrl)
      .subscribe({

        next: (categories) => {

          // Get Items
          this.http.get<ApiMenuItem[]>(this.itemApiUrl)
            .subscribe({

              next: (items) => {

                this.buildMenu(categories, items);

                this.isMenuLoading = false;

                // Reinitialize observer after API data
                setTimeout(() => {

                  this.setupCategoryObserver();

                }, 300);

              },

              error: (error) => {

                console.error(
                  'Get menu items error:',
                  error
                );

                this.errorMessage =
                  'Unable to load menu items.';

                this.isMenuLoading = false;

              }

            });

        },

        error: (error) => {

          console.error(
            'Get menu categories error:',
            error
          );

          this.errorMessage =
            'Unable to load menu categories.';

          this.isMenuLoading = false;

        }

      });

  }


  // BUILD MENU

  buildMenu(
    categories: MenuCategory[],
    items: ApiMenuItem[]
  ): void {

    // Only active categories
    const activeCategories =
      categories.filter(
        category =>
          !category.status ||
          category.status === 'Active'
      );


    // Sort categories
    activeCategories.sort(
      (a, b) =>
        (a.sortOrder ?? 0) -
        (b.sortOrder ?? 0)
    );


    this.categories =
      activeCategories.map(category => {

        const categoryItems =
          items

            .filter(item => {

              return (
                item.categoryId === category._id &&
                (!item.status ||
                  item.status === 'Active')
              );

            })

            .sort(
              (a, b) =>
                (a.sortOrder ?? 0) -
                (b.sortOrder ?? 0)
            );


        return {

          ...category,

          items: categoryItems

        };

      });


    // Set first category
    if (this.categories.length > 0) {

      const exists =
        this.categories.some(
          category =>
            category.name ===
            this.selectedCategory
        );


      if (!exists) {

        this.selectedCategory =
          this.categories[0].name;

      }

    }

  }


  // SEARCH

  get filteredCategories(): MenuCategory[] {

    if (!this.searchText.trim()) {

      return this.categories;

    }


    const search =
      this.searchText
        .toLowerCase()
        .trim();


    return this.categories

      .map(category => ({

        ...category,

        items: category.items.filter(item => {

          return (

            item.name
              .toLowerCase()
              .includes(search)

            ||

            item.hindi
              .includes(this.searchText.trim())

          );

        })

      }))

      .filter(category =>
        category.items.length > 0
      );

  }


  // HALF / FULL PRICE CHECK

  hasHalfFullPrices(
    category: MenuCategory
  ): boolean {

    return category.items.some(
      item =>
        item.half !== null &&
        item.half !== undefined ||

        item.full !== null &&
        item.full !== undefined
    );

  }


  // CATEGORY CLICK

  selectCategory(category: string): void {

    this.selectedCategory = category;

  // Scroll the category bar to the active button
  this.scrollActiveCategoryIntoView();


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


  // INTERSECTION OBSERVER

  ngAfterViewInit(): void {

    // Don't call observer here because
    // API data may not be loaded yet.

  }


  setupCategoryObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  
    this.observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[id^="category-"]'
          )
        )
          .map((section) => ({
            section,
            rect: section.getBoundingClientRect()
          }))
          .filter(({ rect }) =>
            rect.bottom > 0 &&
            rect.top < window.innerHeight
          );
  
        if (visibleSections.length === 0) {
          return;
        }
  
        // Choose the section nearest the top of the viewport,
        // accounting for the fixed navbar and sticky category bar.
        const activationLine = 180;
  
        visibleSections.sort((a, b) => {
          const distanceA =
            Math.abs(a.rect.top - activationLine);
  
          const distanceB =
            Math.abs(b.rect.top - activationLine);
  
          return distanceA - distanceB;
        });
  
        const activeSection = visibleSections[0].section;
  
        const category = activeSection.id.replace(
          'category-',
          ''
        );
  
        if (this.selectedCategory !== category) {
          this.selectedCategory = category;
          this.scrollActiveCategoryIntoView();
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px'
      }
    );
  
    document
      .querySelectorAll<HTMLElement>('[id^="category-"]')
      .forEach((section) => {
        this.observer.observe(section);
      });
  }


  // REFRESH MENU

  refreshMenu(): void {

    this.getMenuData();

  }


  // CLEANUP

  ngOnDestroy(): void {

    if (this.observer) {

      this.observer.disconnect();

    }

  }

}