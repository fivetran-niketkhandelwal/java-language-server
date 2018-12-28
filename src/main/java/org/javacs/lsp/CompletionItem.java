package org.javacs.lsp;

import com.google.gson.JsonArray;
import java.util.List;

public class CompletionItem {
    public String label;
    public int kind;
    public String detail;
    public MarkupContent documentation;
    public boolean deprecated, preselect;
    public String sortText, filterText, insertText, insertTextFormat;
    public TextEdit textEdit;
    public List<TextEdit> additionalTextEdits;
    public List<Character> commitCharacters;
    public Command command;
    public JsonArray data;
}
