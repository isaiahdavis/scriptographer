/*
 * Scriptographer
 *
 * This file is part of Scriptographer, a Scripting Plugin for Adobe Illustrator
 * http://scriptographer.org/
 *
 * Copyright (c) 2002-2010, Juerg Lehni
 * http://scratchdisk.com/
 *
 * All rights reserved. See LICENSE file for details.
 * 
 * File created on Apr 10, 2007.
 */

package com.scriptographer.script.rhino;

import java.io.File;

import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.OperatorHandler;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Token;

import com.scratchdisk.script.Scope;
import com.scratchdisk.script.ScriptCanceledException;
import com.scratchdisk.script.rhino.RhinoScope;
import com.scriptographer.ScriptographerEngine;

/**
 * @author lehni
 *
 */
public class RhinoEngine extends com.scratchdisk.script.rhino.RhinoEngine implements OperatorHandler {

	public RhinoEngine() {
		super(new RhinoWrapFactory());
	}

	protected com.scratchdisk.script.rhino.TopLevel makeTopLevel(Context context) {
		return new TopLevel(context);
	}

	protected boolean hasFeature(Context cx, int feature, boolean defaultValue) {
		switch (feature) {
		case Context.FEATURE_DYNAMIC_SCOPE:
			return true;
		}
		return super.hasFeature(cx, feature, defaultValue);
	}

	protected void enter(Context context) {
		super.enter(context);
		// Use pure interpreter mode to allow for
		// observeInstructionCount(Context, int) to work
		context.setOptimizationLevel(-1);
		// Make Rhino runtime to call observeInstructionCount
		// each 20000 bytecode instructions
		context.setInstructionObserverThreshold(20000);
		context.setOperatorHandler(this);
	}

	protected void observeInstructionCount(Context cx, int instructionCount) {
		if (!ScriptographerEngine.updateProgress())
			throw new ScriptCanceledException();
	}

	public String[] getScriptPath(File file) {
		return ScriptographerEngine.getScriptPath(file, true);
	}

	public Object handleOperator(Context cx, Scriptable scope, int operator, Object lhs, Object rhs) {
		// There is a very simple convention for arithmetic operations on objects:
		// Just try to get the according functions on scriptable objects,
		// and perform the operation by executing these.
		// Fall back on the default ScriptRuntime.add for adding,
		// return null for everything else.

		// Wrap String as Scriptable for some of the operators, so we can access
		// its prototype easily too.
		// Note that only the operators that are natively defined for JS can
		// be overridden here!
		if (lhs instanceof String && (
				operator == Token.SUB ||
				operator == Token.MUL ||
				operator == Token.DIV))
			lhs = ScriptRuntime.toObject(cx, scope, lhs);
		// Now perform the magic
		if (lhs instanceof Scriptable) {
			String name = null;
			switch (operator) {
			case Token.ADD:
				name = "add";
				break;
			case Token.SUB:
				name = "subtract";
				break;
			case Token.MUL:
				name = "multiply";
				break;
			case Token.DIV:
				name = "divide";
				break;
			case Token.MOD:
				name = "modulo";
				break;
			case Token.EQ:
			case Token.NE:
				name = "equals";
				break;
			}
			if (name != null) {
				Scriptable scriptable = (Scriptable) lhs;
				Object obj = ScriptableObject.getProperty(scriptable, name);
				if (obj instanceof Callable) {
					Object result = ((Callable) obj).call(cx, scope, scriptable, new Object[] { rhs });
					if (operator == Token.EQ || operator == Token.NE) {
						boolean value = ScriptRuntime.toBoolean(result);
						if (operator == Token.NE)
							value = !value;
						return ScriptRuntime.wrapBoolean(value);
					} else {
						return result;
					}
				}
		   }
		}
		return null;
	}

	public Object handleSignOperator(Context cx, Scriptable scope, int operator, Object rhs) {
		switch (operator) {
		case Token.NEG:
			// Wrap String as Scriptable, so we can access its prototype easily too.
			if (rhs instanceof String)
				rhs = ScriptRuntime.toObject(cx, scope, rhs);
			// Now perform the magic
			if (rhs instanceof Scriptable) {
				Scriptable scriptable = (Scriptable) rhs;
				Object obj = ScriptableObject.getProperty(scriptable, "negate");
				if (obj instanceof Callable)
					return ((Callable) obj).call(cx, scope, scriptable, new Object[] {});
			}
			break;
		case Token.POS:
			// Simple return the rhs, since the standard JS way would be to force conversion
			// to a number, which would give NaN for new Point(1, 2) * 1, since this is
			// converted top + new Point(1, 2) by the interpreter...
			return rhs;
		}
		return null;
	}

	public Scope createScope() {
		Scope scope = super.createScope();
		// Override global to point to the 'local' global scope ;)
		scope.put("global", ((RhinoScope) scope).getScope());
		return scope;
	}
}
