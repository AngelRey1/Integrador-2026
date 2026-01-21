import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisResenasComponent } from './mis-resenas.component';

describe('MisResenasComponent', () => {
  let component: MisResenasComponent;
  let fixture: ComponentFixture<MisResenasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MisResenasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisResenasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
