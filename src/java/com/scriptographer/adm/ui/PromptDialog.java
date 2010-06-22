/*
 * Scriptographer
 * 
 * This file is part of Scriptographer, a Plugin for Adobe Illustrator.
 * 
 * Copyright (c) 2002-2010 Juerg Lehni, http://www.scratchdisk.com.
 * All rights reserved.
 *
 * Please visit http://scriptographer.org/ for updates and contact.
 * 
 * -- GPL LICENSE NOTICE --
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 * -- GPL LICENSE NOTICE --
 * 
 * File created on 28.03.2005.
 * 
 * $Id:PromptDialog.java 402 2007-08-22 23:24:49Z lehni $
 */

package com.scriptographer.adm.ui;

import java.awt.FlowLayout;
import java.util.LinkedHashMap;
import java.util.Map;

import com.scriptographer.adm.Button;
import com.scriptographer.adm.ItemGroup;
import com.scriptographer.adm.ModalDialog;
import com.scriptographer.adm.layout.TableLayout;
import com.scriptographer.ui.Component;

/**
 * @author lehni
 * 
 * @jshide
 */
public class PromptDialog extends ModalDialog {

	private Component[] components = null;
	private Object[] values = null;

	public PromptDialog(String title, Component[] components) {
		setTitle(title);
		this.components = components;

		// Create row of buttons
		ItemGroup buttons = new ItemGroup(this);
		buttons.setLayout(new FlowLayout(FlowLayout.RIGHT, 0, 0));
		buttons.setMarginTop(8);

		Button cancelButton = new Button(this);
		cancelButton.setText("Cancel");
		cancelButton.setMarginRight(4);
		buttons.addToContent(cancelButton);

		Button okButton = new Button(this);
		okButton.setText("  OK  ");
		buttons.addToContent(okButton);
		
		// Add one more row for the buttons to the layout.
		TableLayout layout =
				AdmPaletteProxy.createLayout(this, components, true, 1, 5);

		int numRows = layout.getNumRow();

		// Add row of buttons to the layout
		addToContent(buttons, "1, " + (numRows - 1) + ", 2, "
				+ (numRows - 1) + ", right, top");

		setDefaultItem(okButton);
		setCancelItem(cancelButton);
		setMargin(8);
	}

	public Object[] getValues() {
		if (values == null) {
			values = new Object[components.length];
			
			for (int i = 0; i < components.length; i++) {
				Component item = components[i];
				if (item != null)
					values[i] = item.getValue();
			}
		}
		return values;
	}

	public static Object[] prompt(String title, Component[] components) {
		/* 
		// TODO: Remove this code as soon as there is another nice way to store
		// values in preferences.
		Preferences preferences = 
			new Preferences(ScriptographerEngine.getPreferences(true));
		String itemTitle = "item" + StringUtils.capitalize(title);
		for (int i = 0; i < components.length; i++) {
			PaletteComponent component = components[i];
			if (component != null) {
				if (component.getName() == null)
					component.setName(itemTitle + component.getLabel() + i);
				Object value = preferences.get(component.getName());
				if (value != null)
					component.setValue(value);
			}
		}
		*/
		PromptDialog dialog = new PromptDialog(title, components);
		if (dialog.doModal() == dialog.getDefaultItem()) {
			Object[] values = dialog.getValues();
			/*
			for (int i = 0; i < components.length; i++) {
				PaletteComponent component = components[i];
				if (component != null)
					preferences.put(component.getName(), values[i]);
			}
			*/
			return values;
		}
		return null;
	}

	public static Map<String, Object> prompt(String title,
			Map<String, Object> components, Map<String, Object> values) {
		Component[] comps =
				Component.getComponents(components, values);
		Object[] results = prompt(title, comps);
		if (results != null) {
			if (values == null)
				values = new LinkedHashMap<String, Object>();
			for (int i = 0; i < comps.length; i++)
				values.put(comps[i].getName(), results[i]);
		}
		return values;
	}
}