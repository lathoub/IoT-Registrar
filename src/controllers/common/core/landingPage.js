import accepts from 'accepts';
import landingPage from '../../../models/common/core/landingPage.js';
import utils from '../../../utils/utils.js';

export async function get(req, res) {

    // Note: trailing slash is allowed here (as it it not a resource path)

    var queryParams = ['f']
    var rejected = utils.checkForAllowedQueryParams(req.query, queryParams)
    if (rejected.length > 0) 
    {
        res.status(400).json({'code': `The following query parameters are rejected: ${rejected}`, 'description': 'Valid parameters for this request are ' + queryParams })
        return 
    }

    var formatFreeUrl = utils.getFormatFreeUrl(req)

    var accept = accepts(req)
    var format = accept.type(['json', 'html'])

    await landingPage.get(formatFreeUrl, format, function (err, content) {

        if (err) {
            res.status(err.httpCode).json({'code': err.code, 'description': err.description })
            return
        }

        switch (format) {
            case 'json':
                // Recommendations 1, A 200-response SHOULD include the following links in the links property of the response:
                res.set('link', utils.makeHeaderLinks(content.links))
                res.status(200).json(content)
                break
            case `html`:
                // Recommendations 1, A 200-response SHOULD include the following links in the links property of the response:
                res.set('link', utils.makeHeaderLinks(content.links))
                res.status(200).render(`landingPage`, content)
                break
            default:
                res.status(400).json({ 'code': 'InvalidParameterValue', 'description': `${accept} is an invalid format` })
        }
    })
}
