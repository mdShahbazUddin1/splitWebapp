import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../services/user-c.service';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent implements OnInit {
  groupForm!: FormGroup;
  selectedImage: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      groupMembers: this.fb.array([this.createMember()]),
      groupImage: [''],
      groupType: ['Home', Validators.required],
    });
  }

  get groupMembers() {
    return this.groupForm.get('groupMembers') as FormArray;
  }

  createMember(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  removeMember(index: number) {
    this.groupMembers.removeAt(index);
  }

  addMember() {
    this.groupMembers.push(this.createMember());
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.groupForm.valid) {
      if (this.selectedImage) {
        this.uploadImage(this.selectedImage).subscribe(
          (response: any) => {
            // console.log(response);
            const secureUrl = response?.resposne?.secure_url;
            if (secureUrl) {
              const groupData = {
                groupName: this.groupForm.value.groupName,
                members: this.groupForm.value.groupMembers,
                groupImage: secureUrl,
                groupType: this.groupForm.value.groupType,
              };

              this.createGroup(groupData);
            } else {
              console.error('No secure URL in the response.');
            }
          },
          (error) => {
            console.error('Image upload failed', error);
          }
        );
      } else {
        const groupData = {
          groupName: this.groupForm.value.groupName,
          members: this.groupForm.value.groupMembers,
          groupImage: '',
          groupType: this.groupForm.value.groupType,
        };

        this.createGroup(groupData);
      }
    } else {
      console.log('Form is invalid');
    }
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post('http://localhost:8080/upload', formData).pipe(
      tap((response: any) => {
        console.log('Backend upload response:', response);
      })
    );
  }

  createGroup(groupData: any) {
    this.userService.createGroup(groupData).subscribe(
      (response) => {
        console.log('Group created successfully:', response);
      },
      (error) => {
        console.error('Error creating group:', error);
      }
    );
  }
}
