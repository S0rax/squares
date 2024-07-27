import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { PuzzleResponse, DecryptedPuzzleResponse } from 'src/models/puzzle';
import { firstValueFrom } from 'rxjs';
import { trigger, style, transition, animate, keyframes } from '@angular/animations';
import { faArrowLeft, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { Word } from 'src/models/word';

type DisplayMode = 'menu' | 'words' | 'optionalWords';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        trigger('showWords', [
            transition(':enter', [
                animate('0.3s', keyframes([
                    style({ display: 'none', height: '0px', opacity: 0, offset: 0 }),
                    style({ display: 'none', height: '0px', opacity: 0, offset: 0.5 }),
                    style({ display: 'block', height: '90px', opacity: 0, offset: 0.51 }),
                    style({ display: 'block', height: '200px', opacity: 1, offset: 1 }),
                ]))
            ]),
            transition(':leave', [animate('0.15s', style({ height: '80px' }))])
        ]),
        trigger('showMode', [
            transition(':enter', [
                animate('0.3s', keyframes([
                    style({ display: 'none', height: '0px', opacity: 0, offset: 0 }),
                    style({ display: 'none', height: '0px', opacity: 0, offset: 0.5 }),
                    style({ display: 'block', height: '90px', opacity: 0, offset: 0.51 }),
                    style({ display: 'block', height: '90px', opacity: 1, offset: 1 }),
                ]))
            ]),
            transition(':leave', [animate('0.15s', style({ opacity: 0 }))])
        ]),
        trigger('showMenu', [
            transition(':enter', [style({ opacity: 0 }), animate('0.15s 0.15s', style({ opacity: 1 }))]),
            transition(':leave', [animate('0.15s', style({ opacity: 0 }))])
        ])
    ]
})
export class AppComponent implements OnInit {
    // consts
    private secret = '8C5a9o2Z8zjmCLHB';
    private startDate = new Date('2024-02-28T00:00:00');

    // props
    showMenu = false;
    mode: DisplayMode = 'menu';
    words: Word[] = [];
    optionalWords: Word[] = [];
    foundWords = new Set<string>();

    constructor(private httpClient: HttpClient, library: FaIconLibrary) {
        library.addIcons(faXmark, faMagnifyingGlass, faArrowLeft)
    }

    async ngOnInit(): Promise<void> {
        const difference = Math.abs(new Date().getTime() - this.startDate.getTime())
        const dayMiliseconds = 1000 * 60 * 60 * 24;
        const offset = Math.floor(difference / dayMiliseconds);
        const puzzleResponse = await firstValueFrom(this.httpClient.get<PuzzleResponse>(`https://squares.org/api/v1/basic/load-puzzles?offset=${offset}`));
        const wordArray = CryptoJS.AES.decrypt(puzzleResponse.puzzles, this.secret);
        const decrypted = CryptoJS.enc.Utf8.stringify(wordArray);
        const decryptedPuzzleResponse = JSON.parse(decrypted) as DecryptedPuzzleResponse[];
        const puzzle = decryptedPuzzleResponse.reduce((acc, next) => next.id > acc.id ? next : acc);
        this.words = [...puzzle.words].sort((a, b) =>  b.length - a.length || a.localeCompare(b)).map(x => ({ word: x, found: false }));
        this.optionalWords = puzzle.optionalWords.map(x => ({ word: x, found: false }));

        setInterval(this.updateWords.bind(this), 100);
    }

    private updateWords(): void {
        const wordDivs = document.querySelectorAll('.foundwords__element');
        if (wordDivs.length === this.foundWords.size) return;

        wordDivs.forEach(x => {
            const div = x as HTMLElement;
            if (!this.foundWords.has(div.innerHTML)) {
                this.foundWords.add(div.innerText);
                const word = this.words.find(x => x.word === div.innerText);
                const optionalWord = this.optionalWords.find(x => x.word === div.innerText);
                word && (word.found = true);
                optionalWord && (optionalWord.found = true);
            }
        })
    }
}
