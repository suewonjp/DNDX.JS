set wildignore+=tags,etc/**,external/**,images/**,trashcan/**

"hi uppercaseKeywords ctermfg=Brown guifg=Brown
"autocmd Syntax javascript,java syntax match uppercaseKeywords /\<[A-Z_]\+\>/

iab desc describe("", function() {;<enter>it("", function() {;<enter><esc>dd
iab it() it("", function() {;<enter><esc>dd

nnoremap <c-]> :ptag /<c-r>=expand('<cword>')<cr><cr>
vnoremap <c-]> y:ptag /<c-r>"<cr><cr>

inoremap <c-l> <c-x><c-l>

nnoremap <f5> :!ctags -R --exclude=res --exclude=img www<CR>

