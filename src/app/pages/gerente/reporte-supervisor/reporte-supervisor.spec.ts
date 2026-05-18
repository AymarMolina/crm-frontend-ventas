import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteSupervisor } from './reporte-supervisor';

describe('ReporteSupervisor', () => {
  let component: ReporteSupervisor;
  let fixture: ComponentFixture<ReporteSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteSupervisor],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteSupervisor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
