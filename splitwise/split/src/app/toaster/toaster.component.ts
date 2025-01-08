import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toaster',
  imports: [NgClass, CommonModule],
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.css'],
})
export class ToasterComponent implements OnInit {
  message: string = '';
  type: 'success' | 'error' = 'success';
  isVisible: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  show(message: string, type: 'success' | 'error') {
    this.message = message;
    this.type = type;
    this.isVisible = true;

    setTimeout(() => {
      this.isVisible = false;
    }, 3000); // Hide after 3 seconds
  }
}
