import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampanasList } from './campanas-list';

describe('CampanasList', () => {
  let component: CampanasList;
  let fixture: ComponentFixture<CampanasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampanasList],
    }).compileComponents();

    fixture = TestBed.createComponent(CampanasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
