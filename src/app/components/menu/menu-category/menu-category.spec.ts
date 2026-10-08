import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCategory } from './menu-category';

describe('MenuCategory', () => {
  let component: MenuCategory;
  let fixture: ComponentFixture<MenuCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
