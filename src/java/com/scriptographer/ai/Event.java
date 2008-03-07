/*
 * Scriptographer
 *
 * This file is part of Scriptographer, a Plugin for Adobe Illustrator.
 *
 * Copyright (c) 2002-2008 Juerg Lehni, http://www.scratchdisk.com.
 * All rights reserved.
 *
 * Please visit http://scriptographer.com/ for updates and contact.
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
 * File created on 21.12.2004.
 *
 * $Id$
 */

package com.scriptographer.ai;

/**
 * @author lehni
 */
public class Event {
	private Point point;
	private Point lastPoint;
	private Point delta;
	private int count;
	
	private double pressure;
	
	protected Event() {
		// Start with valid values, for mouse move events before the first mouse up.
		setValues(0, 0, 0, 0, true);
	}
	
	protected boolean setValues(float x, float y, int pressure,
			float deltaThreshold, boolean start) {
		if (deltaThreshold == 0 || point.getDistance(x, y) >= deltaThreshold) {
			if (start) {
				lastPoint = null;
				delta = new Point();
				count = 0;
			} else {
				lastPoint = point;
				delta.set(x - point.x, y - point.y);
				count++;
			}
			point = new Point(x, y);
			this.pressure = pressure / 255.0;
			return true;
		}
		return false;
	}

	public String toString() {
		StringBuffer buf = new StringBuffer(16);
		buf.append("{ point: ").append(point.toString());
		buf.append(", pressure: ").append(pressure);
		buf.append(" }");
		return buf.toString();
	}

	public Point getPoint() {
		return new Point(point);
	}

	public Point getLastPoint() {
		return new Point(lastPoint);
	}

	public Point getDelta() {
		return new Point(delta);
	}

	public double getPressure() {
		return pressure;
	}

	public int getCount() {
		return count;
	}
	
	// TODO: Consider adding these, present since CS2
	/**
	 * For graphic tablets, tangential pressure on the finger wheel of the
	 * airbrush tool.
	 */
	// AIToolPressure stylusWheel;
	/*
	 * How the tool is angled, also called altitude or elevation.
	 */
	// AIToolAngle tilt;
	/*
	 * The direction of tilt, measured clockwise in degrees around the Z axis,
	 * also called azimuth,
	 */
	// AIToolAngle bearing;
	/*
	 * Rotation of the tool, measured clockwise in degrees around the tool's
	 * barrel.
	 */
	// AIToolAngle rotation;
}
