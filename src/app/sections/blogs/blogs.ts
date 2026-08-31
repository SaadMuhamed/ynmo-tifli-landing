import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-blogs',
  styleUrl: './blogs.scss',
  templateUrl: './blogs.html',
})
export class Blogs {}
