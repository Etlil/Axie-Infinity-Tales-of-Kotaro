const {test,expect}=require('@playwright/test');
test('anti-aliasing applies immediately and survives reload',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Settings',exact:true}).click();
 const toggle=page.getByRole('switch',{name:'Anti-aliasing'});
 await expect(toggle).toHaveAttribute('aria-checked','true');await toggle.click();
 await expect(toggle).toHaveAttribute('aria-checked','false');
 await expect(page.locator('canvas')).toHaveCSS('image-rendering','pixelated');
 await page.reload();await page.getByRole('button',{name:'Settings',exact:true}).click();
 await expect(toggle).toHaveAttribute('aria-checked','false');await toggle.click();
 await expect(page.locator('canvas')).toHaveCSS('image-rendering','auto');
});
