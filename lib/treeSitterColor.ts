import * as Parser from 'web-tree-sitter';

export function colorJava(root: Parser.SyntaxNode, visibleRanges: {start: number, end: number}[]): {[scope: string]: Parser.SyntaxNode[]} {
	const colors: {[scope: string]: Parser.SyntaxNode[]} = {
		'entity.name.type': [],
		'variable': [],
	};
	class Scope {
		private vars = new Map<string, {local:boolean}>();
		private parent: Scope|null;

		constructor(parent: Scope|null) {
			this.parent = parent;
		}

		declareLocal(id: string) {
			if (this.isRoot()) return;
			this.vars.set(id, {local:true});
		}

		declareField(id: string) {
			if (this.isRoot()) return;
			this.vars.set(id, {local:false});
		}

		isLocal(id: string): boolean {
			if (this.vars.has(id)) return this.vars.get(id)!.local;
			if (this.parent) return this.parent.isLocal(id);
			return false;
		}

		isRoot(): boolean {
			return this.parent == null;
		}
	}
	function scanProgram(x: Parser.SyntaxNode) {
		const scope = new Scope(null);
		for (const child of x.namedChildren) {
			if (!isVisible(child, visibleRanges)) continue;
			switch (child.type) {
				case 'package_declaration':
				case 'import_declaration':
					break;
				case 'class_declaration':
					scanTopLevelClass(child, scope);
					break;
				default:
					scan(child, scope);
			}
		}
	}
	function scanTopLevelClass(x: Parser.SyntaxNode, scope: Scope) {
		for (const child of x.children) {
			if (!isVisible(child, visibleRanges)) continue;
			scan(x, scope);
		}
	}
	function scan(x: Parser.SyntaxNode, scope: Scope) {
		switch (x.type) {
			case 'ERROR':
				return;
			case 'class_body':
			case 'method_body':
			case 'block':
				scope = new Scope(scope);
				break;
			case 'field_declaration':
				scanFieldDeclaration(x, scope);
				return;
			case 'variable_declarator_id':
				// Anything which isn't a field, must be a local
				scope.declareLocal(x.text);
				return; 
			case 'class_literal':
				colors['entity.name.type'].push(x.firstChild);
				return;
			case 'type_identifier':
				if (x.text != 'var') {
					colors['entity.name.type'].push(x);
				}
				break;
			case 'scoped_identifier':
				colors['variable'].push(x.lastNamedChild!);
				scan(x.firstNamedChild!, scope);
				break;
			case 'identifier':
				switch (x.parent!.type) {
					case 'class_declaration':
					case 'type_parameter':
						colors['entity.name.type'].push(x);
						break;
					case 'method_declarator':
					case 'class_declaration':
					case 'method_invocation':
					case 'method_reference':
						break;
					default:
						if (!looksLikeType(x.text) && !scope.isLocal(x.text)) {
							colors['variable'].push(x);
						}
				}
				break;
			// TODO stop early
		}
		for (const child of x.namedChildren) {
			scan(child, scope)
		}
	}
	function scanFieldDeclaration(x: Parser.SyntaxNode, scope: Scope) {
		switch (x.type) {
			case 'variable_declarator_id':
				scope.declareField(x.text);
				colors['variable'].push(x);
				break;
			case 'type_identifier':
				if (x.text != 'var') {
					colors['entity.name.type'].push(x);
				}
				break;
			default:
				for (const child of x.namedChildren) {
					scanFieldDeclaration(child, scope)
				}
		}
	}
	function looksLikeType(id: string) {
		if (id.length == 0) return false;
		if (id[0].toUpperCase() == id[0]) return true;
		return false;
	}
	scanProgram(root);
	return colors;
}

function isVisible(x: Parser.SyntaxNode, visibleRanges: {start: number, end: number}[]) {
	for (const {start, end} of visibleRanges) {
		const overlap = x.startPosition.row <= end + 1 && start - 1 <= x.endPosition.row;
		if (overlap) return true;
	}
	return false;
}