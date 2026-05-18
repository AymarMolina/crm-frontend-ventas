import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarObjetivos } from './asignar-objetivos';

describe('AsignarObjetivos', () => {
  let component: AsignarObjetivos;
  let fixture: ComponentFixture<AsignarObjetivos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarObjetivos],
    }).compileComponents();

    fixture = TestBed.createComponent(AsignarObjetivos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
