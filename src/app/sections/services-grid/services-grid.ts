import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SERVICES, SERVICES_HEADLINE, type ServiceCard } from '../../content/services.data';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  selector: 'app-services-grid',
  styleUrl: './services-grid.scss',
  templateUrl: './services-grid.html',
})
export class ServicesGrid {
  protected readonly headline = SERVICES_HEADLINE;

  private readonly byId = new Map(SERVICES.map((s) => [s.id, s]));

  private get(id: string): ServiceCard {
    const card = this.byId.get(id);
    if (!card) throw new Error(`Unknown service card id: ${id}`);
    return card;
  }

  protected readonly growthAssessment = this.get('growth-assessment');
  protected readonly shadowTeacher = this.get('shadow-teacher');
  protected readonly hearingTest = this.get('hearing-test');
  protected readonly comprehensiveDiagnosis = this.get('comprehensive-diagnosis');
  protected readonly therapyPrograms = this.get('therapy-programs');
  protected readonly remoteSpecialist = this.get('remote-specialist');
  protected readonly doctorConsultation = this.get('doctor-consultation');
  protected readonly nurseryPicker = this.get('nursery-picker');
  protected readonly daycareCenters = this.get('daycare-centers');
}
